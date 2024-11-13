//@ts-ignore

import { PdfReader } from "pdfreader";
import { GPTClient } from "./utils/gptClientWithProxy";
const { askGPT, createSystemMessage, createUserMessage, getEmbeddings } = GPTClient;

import { promises as fs } from "fs";
import similarity from "compute-cosine-similarity";

async function generateEmbeddingsForPDF(
  pdfPath: string,
  embeddingsFilePath: string
) {
  let currentPage = 1;
  const documentContent = [];

  async function createEmbeddings() {
    console.log("Generating Embeddings...");
    const documentContentWithEmbeddings: { pageContent: any; }[] = [];
    for (const item of documentContent) {
      const openAIResponse = await getEmbeddings(item.pageContent);
      if(openAIResponse){
        const { embedding } = openAIResponse[0];

      documentContentWithEmbeddings.push({
        ...item,
        embedding,
      });

      console.log(
        `Progress: ${Math.round((item.page / documentContent.length) * 100)}%`
      );
      }
    }

    console.log(documentContentWithEmbeddings[71]);

    await fs.writeFile(
      embeddingsFilePath,
      JSON.stringify(documentContentWithEmbeddings),
      "utf8"
    );
  }

  return new Promise(() =>
    new PdfReader().parseFileItems(pdfPath, async (err, item) => {
      if (err) console.error("error:", err);
      if (!item) {
        console.log(documentContent);
        await createEmbeddings();
        // resolve(void);
      } else if (item.page) {
        currentPage = item.page;
        documentContent.push({ page: item.page, pageContent: "" });
      } else if (item.text) {
        documentContent[currentPage - 1].pageContent = documentContent[
          currentPage - 1
        ].pageContent.concat(item.text);
      } else if (item.file) {
        console.log(`Processing ${item.file.path}`);
      } else {
        console.log("Unhandled", item);
      }
    })
  );
}

const pdfPath = "./knowledge.pdf";
const embeddingsPath = "./embeddings.json";

async function askQuestion(question) {
  try {
    const rawDocumentContentWithEmbeddings = await fs.readFile(
      embeddingsPath,
      "utf8"
    );
    const documentContentWithEmbeddings = JSON.parse(
      rawDocumentContentWithEmbeddings
    );

    // console.log("Embeddings correctly retrieved...");
    const questionOpenAIResponse = await getEmbeddings([question]); // get or create
    const { embedding: questionEmbedding } = questionOpenAIResponse[0];

    const docsWithSimilarities = documentContentWithEmbeddings
      .map((doc) => ({
        ...doc,
        similarity: similarity(questionEmbedding, doc.embedding),
      }))
      .sort((d1, d2) => d2.similarity - d1.similarity);

    const answerGenerationSystemMessage = createSystemMessage(`
            You are Automation Testing Engineer who uses Node.js, Playwright, Cucumber to write test cases.
            You will be provided with a pdf file that contains all the existing test cases written using the Gherkin language.
            Do not use any information that is not contained in the data provided.
        `);

    const answerGenerationUserMessage = createUserMessage(`
            The user asked this question: ${question}.
            Use only this data to answer the question: ${JSON.stringify(
              docsWithSimilarities.slice(0, 3).map((d) => d.pageContent)
            )}
        `);

    const answerGenerationResponse = await askGPT(
      [answerGenerationSystemMessage, answerGenerationUserMessage],
      0
    );
    console.log("Hi, Umang! Here's something what I could find - ");
    console.log(answerGenerationResponse);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      console.log("You need to generate your embeddings first...");
      await generateEmbeddingsForPDF(pdfPath, embeddingsPath);
      await askQuestion(question);
    } else {
      console.error(e);
    }
  }
}

// WORKS:
// const q = "Can you share examples of a step that clicks on a button?"
// const q = "Share example of : Login step"; // GOOD demo material
// const q = "Can you share feature file steps for checking status equal to sent in message list ?";


// askQuestion(q1);

// const q = "Can you share the exact feature file step that performs double click on a row ?";
// const q = "Can you share PEGA related steps ?";
// const q6 = "Share example of : fill with dropdown";
// const q = 'Can you share the step for performing API request?';
const q = 'Can you share the step for switching the tab?';
console.log("Hey, AutomationInnovatorAI,", q);
askQuestion(q);

import "dotenv/config";
import { Configuration, CreateEmbeddingResponseDataInner, OpenAIApi } from "openai";
import https from "https";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const { API_VERSION, PROXY_API_KEY, MODEL, EMBEDDINGS_MODEL } = process.env;
const proxyUrl = "https://openaiproxy.clouddev.emiratesnbd.com";

const SYSTEM = "system";
const USER = "user";
const ASSISTANT = "assistant";

const configuration = new Configuration({
  apiKey: PROXY_API_KEY,
  basePath: proxyUrl,
  baseOptions: {
    headers: { "api-key": PROXY_API_KEY },
    params: {
      "api-version": API_VERSION,
    },
  },
});

const openai = new OpenAIApi(configuration);

const askGPT = async (messages, temperature = 0): Promise<string | null> => {
  try {
    const response = await openai.createChatCompletion(
      {
        model: MODEL,
        messages,
        temperature,
      },
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    // const examples = response?.data?.choices?.map(choice => choice.message.content).slice(0, 5);
    return content;
  } catch (e: any) {
    console.error(e);
    return null;
  }
};

const getEmbeddings = async (messages): Promise<CreateEmbeddingResponseDataInner[] | null> => {
  try {
    const response = await openai.createEmbedding(
      {
        model: EMBEDDINGS_MODEL,
        input: messages,
      },
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    const content = response?.data?.data;
    return content;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const createSystemMessage = (message) => ({
  role: SYSTEM,
  content: message,
});

const createUserMessage = (message) => ({
  role: USER,
  content: message,
});

const createAssistantMessage = (message) => ({
  role: ASSISTANT,
  content: message,
});
// Deploy Name, Instance Name

// Proxy  => Deploy Name, Instance Name
const langChainChat = new ChatOpenAI({
  temperature: 0.5,
  modelName: MODEL,
  azureOpenAIApiKey: PROXY_API_KEY,
  azureOpenAIApiVersion: API_VERSION,
  azureOpenAIApiDeploymentName: "",
  azureOpenAIBasePath: proxyUrl,
});

const langChainEmbeddings = new OpenAIEmbeddings({
  modelName: EMBEDDINGS_MODEL,
  azureOpenAIApiVersion: API_VERSION,
  azureOpenAIApiKey: PROXY_API_KEY,
  azureOpenAIBasePath: proxyUrl,
  azureOpenAIApiDeploymentName: "",
  batchSize: 1,
});

export const GPTClient = {
  askGPT,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage,
  getEmbeddings,
  langChainChat,
  langChainEmbeddings,
};

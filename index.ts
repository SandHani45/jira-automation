import { PDFCreator } from "./utils/pdfCreator";
import * as path from "path";

const startUp = () => {
  const featureDirPath = path.join(__dirname, "./src/features/");
  const outputPDFPath = path.join(__dirname, "knowledge.pdf");
  PDFCreator.createPDFFromFolder(featureDirPath, outputPDFPath);

  // Embeddings generation
};

startUp();

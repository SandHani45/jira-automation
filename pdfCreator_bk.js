import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Function to create PDF from all text files in a folder and its subfolders
function createPDFFromFolder(folderPath, outputPDFPath) {
  // Get all files recursively
  const allFiles = getAllFiles(folderPath);
  console.log("All Files:", allFiles);

  // Filter text files
  const textFiles = allFiles.filter(
    (file) => path.extname(file) === ".feature"
  );

  // Create a new PDF document
  const doc = new PDFDocument();

  // Pipe the PDF document to a writable stream
  doc.pipe(fs.createWriteStream(outputPDFPath));

  // Read each text file and add its content to the PDF document
  textFiles.forEach((file, index) => {
    const data = fs.readFileSync(file, "utf8");
    doc.text(data);

    // Add a page break after each file except the last one
    if (index < textFiles.length - 1) {
      doc.addPage();
    }
  });

  // Finalize the PDF and end the stream
  doc.end();

  console.log("PDF created successfully at:", outputPDFPath);
}

export const PDFCreator = {
  createPDFFromFolder,
};

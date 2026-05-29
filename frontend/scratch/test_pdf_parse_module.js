const fs = require('fs');
const pdfModule = require('pdf-parse');

async function main() {
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  const fileBuffer = fs.readFileSync(pdfPath);
  
  const PDFParseClass = pdfModule.PDFParse;
  const parser = new PDFParseClass({ data: fileBuffer });
  
  console.log('Parser properties:', Object.keys(parser));
  console.log('Parser prototype properties:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
  
  try {
    const textResult = await parser.getText();
    console.log('textResult type:', typeof textResult);
    console.log('textResult keys:', textResult ? Object.keys(textResult) : 'null');
    console.log('textResult value:', textResult);
  } catch (err) {
    console.error('Error parsing:', err);
  }
}

main();

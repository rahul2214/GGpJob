const fs = require('fs');
const pdfModule = require('pdf-parse/node');

async function main() {
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF file not found at " + pdfPath);
    return;
  }
  const fileBuffer = fs.readFileSync(pdfPath);
  
  console.log('Keys of pdf-parse/node:', Object.keys(pdfModule));
  const PDFParseClass = pdfModule.PDFParse || pdfModule;
  console.log('PDFParseClass:', PDFParseClass);
  
  try {
    const parser = new PDFParseClass({ data: fileBuffer });
    const textResult = await parser.getText();
    console.log('Parsing successful! Text length:', textResult.text.length);
    console.log('Sample text:', textResult.text.substring(0, 200));
  } catch (err) {
    console.error('Error parsing:', err);
  }
}

main();

const pdfNode = require('pdf-parse/node');
console.log('pdfNode exports:', pdfNode);
console.log('pdfNode keys:', Object.keys(pdfNode));
if (pdfNode.getHeader) {
  console.log('pdfNode.getHeader type:', typeof pdfNode.getHeader);
  console.log('Calling getHeader():', pdfNode.getHeader());
}

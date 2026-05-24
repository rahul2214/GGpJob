const fs = require('fs');
const path = require('path');

async function testPdfjs() {
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF file not found at " + pdfPath);
    return;
  }
  const fileBuffer = fs.readFileSync(pdfPath);
  
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    console.log('pdfjs loaded successfully!');
    
    // Set worker path/source
    const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
    
    // Load document
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer) });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded! Total pages:', pdf.numPages);
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Successfully extracted text! Length:', fullText.length);
    console.log('Sample text:', fullText.substring(0, 200));
  } catch (err) {
    console.error('Error with pdfjs-dist:', err);
  }
}

testPdfjs();

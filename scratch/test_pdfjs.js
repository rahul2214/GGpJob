const fs = require('fs');
const path = require('path');

async function main() {
  // Polyfill DOMMatrix
  if (typeof global !== 'undefined' && !('DOMMatrix' in global)) {
    global.DOMMatrix = class DOMMatrix {
      constructor(init) {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        if (Array.isArray(init)) {
          if (init.length === 6) {
            this.a = init[0]; this.b = init[1]; this.c = init[2];
            this.d = init[3]; this.e = init[4]; this.f = init[5];
          } else if (init.length >= 16) {
            this.a = init[0]; this.b = init[1]; this.c = init[4];
            this.d = init[5]; this.e = init[12]; this.f = init[13];
          }
        }
      }
      toString() {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
      }
    };
  }

  // Load pdfjs-dist
  console.log('Importing pdfjs-dist...');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Set workerSrc
  console.log('Setting workerSrc...');
  pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

  // Try parsing a PDF
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.log('PDF file not found at:', pdfPath);
    return;
  }
  const buffer = fs.readFileSync(pdfPath);
  
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  });

  try {
    const pdf = await loadingTask.promise;
    console.log('PDF successfully loaded! Number of pages:', pdf.numPages);
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    console.log('Page 1 items count:', textContent.items.length);
  } catch (error) {
    console.error('Failed to parse PDF:', error);
  }
}

main().catch(console.error);

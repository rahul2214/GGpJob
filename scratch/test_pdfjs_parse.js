const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

// We can dynamic-import parse-pdf.ts using ts-node or compile it on the fly,
// or we can write a quick JS version of the exact same logic.
// The exact same logic uses dynamic imports of 'pdfjs-dist/legacy/build/pdf.mjs'.

async function testPdfjs() {
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF file not found at " + pdfPath);
    return;
  }
  const buffer = fs.readFileSync(pdfPath);

  // Polyfill DOMMatrix for Node.js
  if (typeof global !== 'undefined' && !('DOMMatrix' in global)) {
    global.DOMMatrix = class DOMMatrix {
      constructor(init) {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        if (Array.isArray(init)) {
          if (init.length === 6) {
            this.a = init[0]; this.b = init[1]; this.c = init[2];
            this.d = init[3]; this.e = init[4]; this.f = init[5];
          }
        }
      }
    };
  }

  try {
    console.log("Importing pdfjs-dist...");
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
    globalThis.pdfjsWorker = pdfjsWorker;

    console.log("Loading document...");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log("Success! Parsed text length via pdfjs-dist:", fullText.length);
    console.log("First 300 characters:\n", fullText.substring(0, 300));
  } catch (err) {
    console.error("Error with pdfjs-dist:", err);
  }
}

testPdfjs();

export async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  // Polyfill DOMMatrix for Node.js environments (like Vercel serverless) before importing pdfjs-dist
  if (typeof global !== 'undefined' && !('DOMMatrix' in global)) {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
      a: number; b: number; c: number; d: number; e: number; f: number;
      constructor(init?: any) {
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

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    // Setup worker dynamically - Commented out for Vercel/serverless environments
    // where the worker file path is not resolvable. Unset workerSrc will cause
    // pdfjs to fall back to the built-in fake worker (main thread parsing).
    // if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    //   pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
    // }

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
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return { text: fullText };
  } catch (error) {
    console.error('[parsePDF] Error parsing PDF:', error);
    throw error;
  }
}

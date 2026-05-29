const fs = require('fs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
  if (!fs.existsSync(filePath)) {
    console.error('pdf.mjs not found at:', filePath);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('pdf.worker')) {
      console.log(`${i + 1}: ${lines[i].trim()}`);
    }
  }
}

main().catch(console.error);

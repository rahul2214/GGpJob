const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const root = path.join(__dirname, '..');
const results = [];

walkDir(root, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('pdf-parse') || content.includes('pdfjs-dist') || content.includes('parsePDF')) {
      results.push({
        file: path.relative(root, filePath),
        hasPdfParse: content.includes('pdf-parse'),
        hasPdfjsDist: content.includes('pdfjs-dist'),
        hasParsePdf: content.includes('parsePDF')
      });
    }
  }
});

console.log('Search Results:', JSON.stringify(results, null, 2));

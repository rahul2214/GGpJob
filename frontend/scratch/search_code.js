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

console.log('Searching code for references...');
const rootPath = path.join(__dirname, '..', 'src');
walkDir(rootPath, filePath => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('x.ai') || content.includes('groq') || content.includes('grok')) {
      console.log(`Found in: ${filePath}`);
      // Find matching lines
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('x.ai') || line.includes('groq') || line.includes('grok')) {
          console.log(`  Line ${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
});

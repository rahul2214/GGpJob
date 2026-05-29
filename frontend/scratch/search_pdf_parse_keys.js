const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchDir(filePath, pattern);
    } else if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(pattern)) {
        console.log(`Found pattern "${pattern}" in: ${filePath}`);
        // Find index of pattern and print surrounding 100 characters
        let idx = content.indexOf(pattern);
        while (idx !== -1) {
          const start = Math.max(0, idx - 50);
          const end = Math.min(content.length, idx + 50);
          console.log(`  Context: ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
          idx = content.indexOf(pattern, idx + 1);
        }
      }
    }
  }
}

const targetPath = path.join(__dirname, '../node_modules/pdf-parse');
searchDir(targetPath, 'createRequire');

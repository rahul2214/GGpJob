const fs = require('fs');
const path = require('path');

function searchDir(dir, fileName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchDir(filePath, fileName);
    } else if (file === fileName) {
      console.log('Found file:', filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      console.log('Total lines:', lines.length);
      // Let's find "loadPDFParse" in the file
      lines.forEach((line, index) => {
        if (line.includes('loadPDFParse') || line.includes('createRequire')) {
          console.log(`Line ${index + 1}: ${line.substring(0, 150)}`);
        }
      });
    }
  }
}

const buildDir = path.join(__dirname, '../.next');
if (fs.existsSync(buildDir)) {
  searchDir(buildDir, 'route.js');
} else {
  console.log('.next directory not found');
}

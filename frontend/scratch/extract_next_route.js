const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../.next/server/app/api/ats-score/route.js');
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const pattern = 'createRequire';
let idx = content.indexOf(pattern);
console.log('Occurrences of createRequire:');
while (idx !== -1) {
  console.log(`- Index ${idx}: ... ${content.substring(idx - 60, idx + 60).replace(/\\n/g, '\n').replace(/\\"/g, '"')} ...`);
  idx = content.indexOf(pattern, idx + 1);
}

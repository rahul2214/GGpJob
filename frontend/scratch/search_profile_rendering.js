const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/profile/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const start = 290;
const end = 350;
for (let j = start - 1; j < end; j++) {
  console.log(`${j + 1}: ${lines[j]}`);
}

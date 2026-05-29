const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/profile/[id]/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('profileUser.')) {
    console.log(`${i + 1}: ${lines[i].trim()}`);
  }
}

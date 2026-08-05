const fs = require('fs');
const path = require('path');

const dir = './supabase';
const files = fs.readdirSync(dir);
for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.statSync(fullPath).isFile() && file.endsWith('.sql')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('employees') && (content.includes('REFERENCES') || content.includes('FOREIGN KEY') || content.includes('alter table'))) {
      console.log(`Found in: ${file}`);
      // Print lines containing employees
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('employees')) {
          console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

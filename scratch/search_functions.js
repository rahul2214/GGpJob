const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, pattern);
    } else if (stat.isFile() && file.endsWith('.sql')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`Found function in: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            console.log(`  Line ${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir('c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/supabase', 'create or replace function');
searchDir('c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/supabase', 'create function');

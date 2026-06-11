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
      if (content.includes(pattern)) {
        console.log(`Found pattern in: ${fullPath}`);
      }
    }
  }
}

searchDir('c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/supabase', 'referral_count');

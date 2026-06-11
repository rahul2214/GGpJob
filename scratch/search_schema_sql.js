const fs = require('fs');
const content = fs.readFileSync('c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/supabase/schema.sql', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('referral') || line.toLowerCase().includes('trigger')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});

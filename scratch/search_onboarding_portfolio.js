const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/src/app/onboarding/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
    if (line.includes('portfolio') || line.includes('Portfolio')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});

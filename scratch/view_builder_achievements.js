const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/src/app/resume-builder/resume-builder-client.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, index) => {
    if (line.includes('achievements') || line.includes('Achievements') || line.includes('certifications') || line.includes('Certifications')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});

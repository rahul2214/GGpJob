const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal/src/app/resume-builder/resume-builder-client.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
    if (line.includes('save') || line.includes('Save') || line.includes('load') || line.includes('Load') || line.includes('localStorage') || line.includes('fetch') || line.includes('/api/')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});

const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
                results = results.concat(walk(filePath));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(rootDir);
console.log(`Found ${files.length} code files. Searching...`);

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const hasAchievements = content.includes('achievements') || content.includes('Achievements');
    const hasCertifications = content.includes('certifications') || content.includes('Certifications');
    if (hasAchievements || hasCertifications) {
        console.log(`File: ${path.relative(rootDir, file)} | achievements: ${hasAchievements} | certifications: ${hasCertifications}`);
    }
}

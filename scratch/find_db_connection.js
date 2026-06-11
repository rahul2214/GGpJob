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
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(rootDir);
console.log(`Found ${files.length} files. Searching for database connection references...`);

for (const file of files) {
    if (file.includes('node_modules') || file.includes('.next') || file.includes('scratch/')) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('DATABASE_URL') || content.includes('postgres://') || content.includes('postgresql://')) {
        console.log(`Found reference in file: ${path.relative(rootDir, file)}`);
    }
}

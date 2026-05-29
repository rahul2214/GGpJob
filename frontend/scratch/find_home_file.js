const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', '.next', '.git', 'dist', 'tmp'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath);
        } else if (file.toLowerCase().includes('home') || file.toLowerCase().includes('jobportal')) {
            console.log(`Match found: ${fullPath}`);
        }
    }
}

console.log('Searching for home page component...');
searchFiles(rootDir);

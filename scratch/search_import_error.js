const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('node_modules') || content.includes('@hookform/resolvers')) {
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('node_modules') || line.includes('@hookform/resolvers')) {
                        console.log(`Found in ${path.relative(path.join(__dirname, '..'), fullPath)} L${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

console.log('Searching for references in src/...');
searchFiles(srcDir);

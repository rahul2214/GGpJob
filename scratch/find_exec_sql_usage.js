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
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('exec_sql')) {
                console.log(`Found usage in: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('exec_sql')) {
                        console.log(`  L${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchFiles(rootDir);

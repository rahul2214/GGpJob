const fs = require('fs');
const path = require('path');

const supabaseDir = path.join(__dirname, '..', 'supabase');

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath);
        } else if (file.endsWith('.sql')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('status') && content.toLowerCase().includes('job')) {
                console.log(`Found match in file: ${file}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.toLowerCase().includes('status') || line.toLowerCase().includes('check')) {
                        console.log(`  L${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

console.log('Searching for jobs table status constraints in SQL files...');
searchFiles(supabaseDir);

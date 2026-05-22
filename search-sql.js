const fs = require('fs');
const path = require('path');

function search(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            search(filePath);
        } else if (file.endsWith('.sql')) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('exec_sql')) {
                console.log(`Found in: ${filePath}`);
            }
        }
    });
}

search('supabase');

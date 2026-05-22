const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(filePath, callback);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.toLowerCase().includes('trustscore') || content.toLowerCase().includes('trust_score')) {
                    callback(filePath);
                }
            } catch(e) {}
        }
    });
}

walk('src', (filePath) => {
    console.log('Found in:', filePath);
});

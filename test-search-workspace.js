const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    let list;
    try {
        list = fs.readdirSync(dir);
    } catch(e) { return; }
    list.forEach(file => {
        const filePath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(filePath);
        } catch(e) { return; }
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(filePath, callback);
            }
        } else if (file.endsWith('.sql') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('exec_sql')) {
                    callback(filePath);
                }
            } catch(e) {}
        }
    });
}

walk('C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design', (filePath) => {
    console.log('Found:', filePath);
});

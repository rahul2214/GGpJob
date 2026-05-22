const fs = require('fs');
const path = require('path');

function walk(dir, filter, callback) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(filePath, filter, callback);
            }
        } else if (filter.test(file)) {
            callback(filePath);
        }
    });
}

const rpcCalls = [];
walk('.', /\.(ts|tsx|js|json)$/, (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let idx = 0;
        while (true) {
            idx = content.indexOf('.rpc(', idx);
            if (idx === -1) break;
            const endIdx = content.indexOf(')', idx);
            const snippet = content.substring(idx, endIdx + 1);
            rpcCalls.push({ file: filePath, snippet });
            idx += 1;
        }
    } catch(e) {}
});

console.log('Found RPC calls:', rpcCalls);

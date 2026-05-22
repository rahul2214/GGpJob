const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const rpcCalls = new Set();

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /supabase\s*\.\s*rpc\s*\(\s*['"`]([^'"`]+)['"`]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                rpcCalls.add(match[1]);
            }
        }
    }
}

console.log('Searching for RPC calls in src/...');
searchFiles(srcDir);
console.log('Found RPC calls:', Array.from(rpcCalls));

const fs = require('fs');
const files = ['.env', '.env.local', '.env.development', '.env.production'];
files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        console.log(`--- ${f} ---`);
        content.split('\n').forEach(line => {
            if (line.match(/(pass|db|postgres|conn|url|key)/i)) {
                // mask values for security
                const parts = line.split('=');
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim();
                console.log(`${k} = ${v ? (v.length > 8 ? v.substring(0, 8) + '...' : '***') : ''}`);
            }
        });
    } catch(e) {}
});

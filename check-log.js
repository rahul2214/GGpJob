const fs = require('fs');
try {
    const log = fs.readFileSync('migration_log.txt', 'utf16le');
    const lines = log.split('\n');
    console.log(`Total lines in log: ${lines.length}`);
    lines.slice(0, 50).forEach((l, idx) => console.log(`${idx + 1}: ${l}`));
} catch(e) {
    console.error(e);
}

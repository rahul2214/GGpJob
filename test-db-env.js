const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
env.split('\n').forEach(line => {
    if (line.match(/(db|postgres|pass)/i)) {
        console.log(line.trim());
    }
});

const fs = require('fs');
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    console.log('.env.local keys:', env.split('\n').map(l => l.split('=')[0]));
} catch(e) {}
try {
    const env = fs.readFileSync('.env', 'utf8');
    console.log('.env keys:', env.split('\n').map(l => l.split('=')[0]));
} catch(e) {}

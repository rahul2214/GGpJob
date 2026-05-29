const fs = require('fs');
let envFile = '';
try {
    envFile = fs.readFileSync('.env.local', 'utf8');
} catch(e) {
    envFile = fs.readFileSync('.env', 'utf8');
}
const lines = envFile.split('\n');
for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        console.log('SUPABASE URL:', line.split('=')[1].trim());
    }
}

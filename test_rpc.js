require('dotenv').config({ path: '.env' });
console.log('Env keys:', Object.keys(process.env).filter(k => k.includes('SUPA') || k.includes('DB') || k.includes('POSTGRES')));

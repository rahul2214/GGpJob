require('dotenv').config({ path: '.env' });
console.log(Object.keys(process.env).filter(k => k.includes('DATA') || k.includes('POSTGRES') || k.includes('SUPABASE')));

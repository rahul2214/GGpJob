require('dotenv').config();
console.log("Environment Keys:", Object.keys(process.env).filter(k => 
  k.includes('DB') || 
  k.includes('POSTGRES') || 
  k.includes('URL') || 
  k.includes('CONN') || 
  k.includes('KEY') || 
  k.includes('SECRET')
));

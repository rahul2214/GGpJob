require('dotenv').config({ path: '.env' });

console.log("GROK_API_KEY present:", !!process.env.GROK_API_KEY);
if (process.env.GROK_API_KEY) console.log("GROK_API_KEY prefix:", process.env.GROK_API_KEY.substring(0, 5));

console.log("GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);
if (process.env.GROQ_API_KEY) console.log("GROQ_API_KEY prefix:", process.env.GROQ_API_KEY.substring(0, 5));

console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

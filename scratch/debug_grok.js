const fs = require('fs');
const path = require('path');

async function testGroq() {
  let envFile = '';
  const rootPath = path.join(__dirname, '..');
  try {
    envFile = fs.readFileSync(path.join(rootPath, '.env.local'), 'utf8');
  } catch(e) {
    envFile = fs.readFileSync(path.join(rootPath, '.env'), 'utf8');
  }
  
  const lines = envFile.split('\n');
  let key = '';
  for (const line of lines) {
    if (line.startsWith('GROK_API_KEY=')) key = line.split('=')[1].trim();
  }
  key = key.replace(/['";\r]/g, '').trim();

  console.log('Using Key Prefix:', key.substring(0, 7));

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a precise JSON assistant. Respond with a JSON object containing a greeting."
      },
      {
        role: "user",
        content: "Hello!"
      }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testGroq();

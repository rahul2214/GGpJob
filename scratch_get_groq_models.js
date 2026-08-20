require('dotenv').config({ path: '.env' });

const apiKey = process.env.GROQ_API_KEY;

async function listGroqModels() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`
    }
  });

  const json = await res.json();
  console.log("Available Groq Models:");
  if (json.data) {
    json.data.forEach(m => console.log(`  • ID: "${m.id}"`));
  } else {
    console.log("Error or response:", json);
  }
}

listGroqModels();

require('dotenv').config({ path: '.env' });

const apiKey = process.env.GROQ_API_KEY;
console.log("Testing Groq API call with key starting with:", apiKey ? apiKey.substring(0, 5) : "none");

async function testGroqModels() {
  const models = ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"];

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "Hello, reply with JSON: {\"status\": \"ok\"}" }],
          response_format: { type: "json_object" }
        })
      });

      console.log(`Model ${model} response status: ${res.status}`);
      if (!res.ok) {
        const txt = await res.text();
        console.log(`Model ${model} error text:`, txt);
      } else {
        const json = await res.json();
        console.log(`🎉 SUCCESS with ${model}:`, json.choices[0].message.content);
        break;
      }
    } catch (err) {
      console.error(`Model ${model} fetch exception:`, err);
    }
  }
}

testGroqModels();

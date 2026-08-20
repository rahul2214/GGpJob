require('dotenv').config({ path: '.env' });

const apiKey = process.env.GROQ_API_KEY;

async function testGroqResumeParse() {
  const modelsToTest = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "groq/compound"];

  for (const model of modelsToTest) {
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
          messages: [
            { role: "system", content: "You are a precise JSON API. Return only valid JSON." },
            { role: "user", content: "Extract profile data: Resume of Rahul Naik, Software Engineer at Dhruv Tech, phone +91 6302806154. Return JSON: {\"name\": \"Rahul\", \"phone\": \"6302806154\"}" }
          ],
          response_format: { type: "json_object" }
        })
      });

      console.log(`Model ${model} status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`🎉 SUCCESS with ${model}:`, data.choices[0].message.content);
        break;
      } else {
        const txt = await res.text();
        console.log(`Model ${model} error:`, txt);
      }
    } catch (err) {
      console.error(`Exception with ${model}:`, err);
    }
  }
}

testGroqResumeParse();

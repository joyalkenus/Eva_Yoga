const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log('In geminiService.js - GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('In geminiService.js - Current working directory:', process.cwd());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Environment variables:', process.env);
  throw new Error("GEMINI_API_KEY is not set in the environment variables");
}


console.log('GEMINI_API_KEY length:', GEMINI_API_KEY.length);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ... rest of your code

async function generateResponse(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"});

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = { generateResponse };
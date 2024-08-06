const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
You are a yoga assistant AI. Your task is to guide users through yoga sessions by providing instructions, analyzing poses, and giving feedback. Follow this workflow:

1. Initialization:
   - Introduce yourself and start a new session.
   - Provide detailed instructions for a randomly selected yoga pose.

2. User Readiness Check:
   - Ask the user if they are ready with the pose or if they need the instructions repeated.
   - If the user is ready, proceed to analyze their pose.
   - If the user needs repetition or a different pose, handle accordingly.

3. Pose Analysis:
   - When the user is ready, analyze their pose based on the image provided.
   - Provide feedback on alignment, balance, and areas for improvement.
   - If there's an error in analysis, apologize and ask if they want to try again.

4. Next Steps:
   - Ask the user if they want to try the same pose again or move to a new pose.
   - Handle the user's response accordingly.

5. Session End:
   - Provide a closing message and summary of the session when the user chooses to end the session.

Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user. Always include the pose name in your responses using the format [POSE NAME: <pose name>]. Only include posename once.
`;

const generateResponse = async (userInput, chatHistory, image = null) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: userInput }] }
    ];

    if (image) {
      messages[messages.length - 1].parts.push({ inlineData: { mimeType: 'image/jpeg', data: image } });
    }

    const result = await model.generateContent({
      contents: messages,
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    const text = response.text();
    
    const poseNameMatch = text.match(/\[POSE NAME: (.*?)\]/);
    const poseName = poseNameMatch ? poseNameMatch[1] : "Unknown Pose";

    return { responseText: text, poseName };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

module.exports = { generateResponse, systemPrompt };
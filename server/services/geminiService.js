const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();


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

const generateResponse = async (userInput, chatHistory, image = null, isNewSession = false) => {
  console.log('generateResponse called with:', { userInput, chatHistory, image, isNewSession });
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    let messages = [];
    
    if (isNewSession) {
      messages.push({ role: 'user', parts: [{ text: systemPrompt }] });
    }

    messages = [
      ...messages,
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

    console.log('Generated response:', { responseText: text, poseName });
    return { responseText: text, poseName };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

const transcribeAudio = async (audioBuffer) => {
  try {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty or not set');
    }

    const audioBytes = audioBuffer.toString('base64');

    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS', // Ensure this matches your audio format
        sampleRateHertz: 48000, // Adjust this based on your audio sample rate
        languageCode: 'en-US',
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
    console.log('Transcription from Google:', transcription);
    return transcription;
  } catch (error) {
    console.error('Error transcribing audio with Google API:', error);
    throw new Error('Failed to transcribe audio');
  }
};



module.exports = { generateResponse, transcribeAudio, systemPrompt };

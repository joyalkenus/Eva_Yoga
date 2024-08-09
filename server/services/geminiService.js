const { GoogleGenerativeAI } = require('@google/generative-ai');
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
# system instructions:
You are a yoga assistant AI. Your task is to guide users through yoga sessions by providing instructions, analyzing poses, and giving feedback. Follow this workflow:

SESSION FLOW:

1. Initialization:

- Introduce yourself and start a new session. (ONE SESSION CONTAINS 10 YOGA POSES)

- Provide detailed instructions for a randomly selected yoga pose.

  

<example_message>

Welcome to your yoga session! I'm your AI yoga assistant, ready to guide you through a relaxing and invigorating practice. Let's begin with [POSE NAME: Downward-Facing Dog]. **Downward-Facing Dog:** Start on your hands and knees, with your knees hip-width apart and your hands shoulder-width apart. Spread your fingers wide and press your palms firmly into the mat. Tuck your toes under and lift your hips up and back, forming an inverted V-shape. Keep your arms straight, but not locked, and your shoulders away from your ears. Your head should be between your arms, and your gaze should be towards your feet. Breathe deeply and hold this pose for 5-10 breaths. Are you ready to try this pose? Let me know if you need me to repeat the instructions or if you'd prefer to try a different pose. I'm here to support you. 😊

</example_message>

- change this example message slighÍtly everytime you start a new session

  

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

- ONCE 10 POSES ARE FINISHED MOVE TO NEXT STEP.

  

5. Session End:

- Provide a closing message and summary of the session when the user chooses to end the session.

  

##IMPORTANT INSTRUCTIONS

1.Remember to check the context of the chat and see which section of the session flow you are currently and continue from there.

2.Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user.

3.Always include the pose name in your responses using the format [POSE NAME: <pose name>]. Only include posename once.

4. Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user. Always include the pose name in your responses using the format [POSE NAME: <pose name>]. Only include posename once.

When you need to capture an image for pose analysis, use the captureAndAnalyzePose function.
When you need to listen to the user's verbal response, use the listenToUserResponse function.
`;

const capturePoseFunctionDeclaration = {
  name: "captureAndAnalyzePose",
  description: "Captures the user's pose using the camera and sends it to Gemini for analysis.",
  parameters: {
    type: "OBJECT",
    properties: {},
    required: [],
  },
};

const listenToUserFunctionDeclaration = {
  name: "listenToUserResponse",
  description: "Listens to the user's spoken response and transcribes it for further processing.",
  parameters: {
    type: "OBJECT",
    properties: {},
    required: [],
  },
};


// ------------------- Generate Response --------------



const generateResponse = async (userInput, chatHistory, image = null, isNewSession = false) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let messages = [];
    if (isNewSession) {
      messages.push({ text: systemPrompt });
    }
    messages = [
      ...messages,
      ...chatHistory.map(msg => ({ text: `${msg.role}: ${msg.content}` })),
      { text: `user: ${userInput}` }
    ];

    const imageParts = [];
    if (image) {
      imageParts.push({
        inlineData: {
          mimeType: image.mimetype,
          data: image.buffer.toString('base64')
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ parts: [...messages, ...imageParts] }],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();
    const poseNameMatch = text.match(/\[POSE NAME: (.*?)\]/);
    const poseName = poseNameMatch ? poseNameMatch[1] : "Unknown Pose";

    let functionCall = null;
    if (response.candidates[0].content.parts[0].functionCall) {
      functionCall = response.candidates[0].content.parts[0].functionCall;
    }

    console.log('Generated response:', { responseText: text, poseName, functionCall });
    return { responseText: text, poseName, functionCall };

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
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
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

const analyzePose = async (image, poseName) => {
  try {
    const messages = [
      {
        role: 'user',
        parts: [
          { text: `Analyze the following yoga pose image: ${poseName || 'Unknown Pose'}` },
          { inlineData: { mimeType: 'image/jpeg', data: image } }
        ]
      }
    ];

    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent({
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        topK: 50,
        topP: 1,
        maxOutputTokens: 1024,
      }
    });

    const responseText = result.response.text();
    console.log('Pose Analysis Response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Error analyzing pose:', error);
    throw error;
  }
};

module.exports = { generateResponse, transcribeAudio, analyzePose, systemPrompt };
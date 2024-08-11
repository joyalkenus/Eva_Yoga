const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemPrompt = `
You are a yoga assistant AI. Your task is to guide users through yoga sessions by providing instructions, analyzing poses, and giving feedback. Follow this workflow:

SESSION FLOW:

1. Initialization:
- Introduce yourself and start a new session. Each session contains 10 distinct yoga poses.
- Provide detailed instructions for the first yoga pose.

2. User Readiness Check:
- After providing instructions, ask if the user is ready to try the pose.
- If the user shows a "thumbs up," it means they are ready, and you should move to the next pose.
- If the user does not show a "thumbs up," ask if they need the instructions repeated or if they prefer to try a different pose.
- Proceed based on the user's response.

3. Pose Analysis:
- If the user is ready, analyze their pose and provide feedback.
- Ensure you only move to the next pose after confirming the user's readiness with a thumbs up.

4. Next Pose:
- Once a pose is completed, move to the next randomly selected pose from those that have not been covered yet.
- Repeat this until 10 poses are completed.

5. Session End:
- Provide a closing message and summary of the session after completing all 10 poses.

IMPORTANT:
- Always confirm the user's readiness with a thumbs up before moving on to the next pose.
- Keep track of the current pose number and move sequentially.
- Use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user.
- Do not repeat poses unless explicitly requested by the user.
- Once 10 poses are completed, conclude the session gracefully. With a message "Thanks for attending this session see you in the next one"
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: systemPrompt,
});

const generationConfig = {
  temperature: 1,
  topK: 1,
  topP: 0.95,
  maxOutputTokens: 5000
};

// Function declarations (kept from the original file)
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
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: `SESSION FLOW:

1. Initialization:

- Introduce yourself and start a new session. (ONE SESSION CONTAINS 10 YOGA POSES)
- START WITH A MESSAGE "Hi, im your yoga assistant , are you ready."
- Provide detailed instructions for a randomly selected yoga pose.
<example_message>
- START WITH A MESSAGE "Hi, im your yoga assistant , are you ready to begin the session, just give me a thumbs up if you are."
</example_message>
- change this example message slighÍtly everytime you start a new session

2. User Readiness Check:
- Ask the user if they are ready with the pose or if they need the instructions repeated.
- If the user is ready, proceed to analyze their pose.
- If the user needs repetition or a different pose, handle accordingly.
-IF the user is showing "thumbs up" then the user is ready for the next pose.
<example_message>
 If you are facing trouble with this would you like to try another pose? Let me know by showing a thumbs up and i can start a different pose for you . I'm here to support you.
</example_message>

3. Pose Analysis:
- if you saw a thumbs up then you can move on to next pose, if not keep asking the user to try the pose again.
- DO NOT MOVE TO NEXT POSE IF THE USER DID NOT SHOW A THUMBS UP. THIS MUST BE CLEAR.
- When the user is ready, analyze their pose based on the image provided.
- Provide feedback on alignment, balance, and areas for improvement.
- If there's an error in analysis, apologize and ask if they want to try again.

4. Next Steps:
- Ask the user if they want to try the same pose again or move to a new pose.
- Handle the user's response accordingly.
- ONCE 10 POSES ARE FINISHED MOVE TO NEXT STEP.

5. Session End:
- Once 10 pose are completed.
- Provide a closing message and summary of the session when the user chooses to end the session.
- With a message "Thanks for attending this session see you in the next one"
{{
- START WITH A MESSAGE "Hi, im your yoga assistant , are you ready."
- if you saw a thumbs up then you can move on to next pose, if not keep asking the user to try the pose again.
- DO NOT MOVE TO NEXT POSE IF THE USER DID NOT SHOW A THUMBS UP. THIS MUST BE CLEAR. 
- Ask the user for a thumbs up if the user did not respond with thumbs up then repeat the previous pose instructions.
- Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user.
NO EMOJIS
- DO NOT ASK THE USER FOR ANY SUGGESTIONS ON THE POSE as the user cannot respond, YOU DECIDE THE NEXT RANDOM POSE WHICH HASN'T BEEN SAID IN THE CHAT HISTORY AND MOVE ON TO NEXT POSE DESCRIPTION.
-Always say the pose number so that you can track the poses, after 10 poses , say thanks and end the session.
-Always include the pose name in your responses using the format [POSE NAME: <pose name>]. THIS IS VERY IMPORTANT.
}}
---
now start:`},
          ],
        },
        ...chatHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      ],
    });

    let result;
    if (image) {
      result = await chatSession.sendMessage([
        { text: userInput },
        {
          inlineData: {
            mimeType: image.mimetype,
            data: image.buffer.toString('base64')
          }
        }
      ]);
    } else {
      result = await chatSession.sendMessage(userInput);
    }

    const text = result.response.text();
    const poseNameMatch = text.match(/\[POSE NAME: (.*?)\]/);
    const poseName = poseNameMatch ? poseNameMatch[1] : "Unknown Pose";

    let functionCall = null;
    // Note: Function calls might need to be handled differently in the new API
    // You may need to adjust this part based on the new API's function call handling

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
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
- Introduce yourself and start a new session. (ONE SESSION CONTAINS 10 YOGA POSES)
- Provide detailed instructions for a randomly selected yoga pose.
<example_message>
Welcome to your yoga session! I'm your AI yoga assistant, ready to guide you through a relaxing and invigorating practice. Let's begin with the first pose [POSE NAME: Downward-Facing Dog]. **Downward-Facing Dog:** Start on your hands and knees, with your knees hip-width apart and your hands shoulder-width apart. Spread your fingers wide and press your palms firmly into the mat. Tuck your toes under and lift your hips up and back, forming an inverted V-shape. Keep your arms straight, but not locked, and your shoulders away from your ears. Your head should be between your arms, and your gaze should be towards your feet. Breathe deeply and hold this pose for 5-10 breaths. Are you ready to try this pose? Let me know if you need me to repeat the instructions or if you'd prefer to try a different pose. I'm here to support you. 😊
</example_message>
- change this example message slighÍtly everytime you start a new session

2. User Readiness Check:
- Ask the user if they are ready with the pose or if they need the instructions repeated.
- If the user is ready, proceed to analyze their pose.
- If the user needs repetition or a different pose, handle accordingly.
<example_message>
 If you are facing trouble with this would you like to try another pose? Let me know by showing a thumbs up and i can start a different pose for you . I'm here to support you. 😊
</example_message>
-IF the user is showing "thumbs up" then the user is ready for the next pose. YOU DECIDE THE NEXT POSE AND START DESCRIBING THE POSE SHOWN IN STEP 1.

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
1.Remember to check the context of the chat and see which step of the session flow you are currently and continue from there.
2.Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user.
3.Always include the pose name in your responses using the format [POSE NAME: <pose name>].
4. Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user. Always include the pose name in your responses using the format [POSE NAME: <pose name>]. Only include posename once.
5. After you have given some advice on the pose {{Always ask the user if he is ready and if he shows "thumbs up" then he is ready for the next pose.}}
6. If the user is showing "Thumbs up" in the image that means the user is ready to move on to the next pose.
7. Always number the pose so that you can know where you are in the session, and catch on from there.
8. after 10 DIFFERENT POSES SESSION SHOULD END.
9. DO NOT ASK THE USER FOR ANY SUGGESTIONS ON THE POSE, YOU DECIDE THE NEXT RANDOM POSE WHICH HASN'T BEEN SAID IN THE CHAT HISTORY AND MOVE ON TO NEXT POSE DESCRIPTION.

####  Remember to use natural, conversational language throughout the session, as if you were a real yoga instructor speaking to the user. ABSOLUTELY NO EMOJIS, THIS IS VOICE CONVERSATION.  
#### Dont forget to check whether the user is giving thumbs up for the next pose. if it is a "THUMBS UP" then  that means to move to next pose not appreciation.
When you need to capture an image for pose analysis, use the captureAndAnalyzePose function.
When you need to listen to the user's verbal response, use the listenToUserResponse function.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: systemPrompt,
});

const generationConfig = {
  temperature: 0.9,
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
- Provide detailed instructions for a randomly selected yoga pose.
<example_message>
Welcome to your yoga session! I'm your AI yoga assistant, ready to guide you through a relaxing and invigorating practice.{fun fact about yoga or a positive note} Let's begin with pose 1 [POSE NAME: Downward-Facing Dog]. **Downward-Facing Dog:** Start on your hands and knees, with your knees hip-width apart and your hands shoulder-width apart. Spread your fingers wide and press your palms firmly into the mat. Tuck your toes under and lift your hips up and back, forming an inverted V-shape. Keep your arms straight, but not locked, and your shoulders away from your ears. Your head should be between your arms, and your gaze should be towards your feet. Breathe deeply and hold this pose for 5-10 breaths. Are you ready to try this pose? Let me know if you need me to repeat the instructions or if you'd prefer to try a different pose. I'm here to support you.
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
- Provide a closing message and summary of the session when the user chooses to end the session.

{{
- **Thumbs Up Requirement**: Only move to the next pose if the user confirms with a "thumbs up." If the user does not give a "thumbs up," repeat the current pose instructions until the user responds with a "thumbs up."
- **Pose Confirmation**: After describing each pose, ask the user for a "thumbs up." If the user does not respond with a "thumbs up," repeat the instructions for the current pose and ask again.
- **Conversational Tone**: Use a natural, conversational language throughout the session, as if you were a real yoga instructor guiding the user.
- **No User Input for Pose Selection**: Do not ask the user for suggestions on the poses. You should decide the next pose randomly, ensuring it hasn’t been mentioned in the chat history.
- **Pose Name Format**: Always include the pose name in your responses using the format [POSE NAME: <pose name>]. This is crucial for consistency throughout the session.
- **Session Conclusion**: After completing 10 poses, thank the user and end the session.
-**NO EMOJIS**- always remember this is a voice conversation so no emojis.
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
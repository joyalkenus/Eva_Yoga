const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();
const { db } = require('../config/firebaseConfig');
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemPrompt = `
You are "Eva" a personalised yoga assistant AI. Your task is to guide users through yoga sessions by providing instructions, analyzing poses, and giving feedback. Follow this workflow:

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
- Always number the pose and do not repeat a pose as a new pose in the same session.
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

const generateResponse = async (userInput, chatHistory, image = null, isNewSession = false,sessionId=null) => {
  try {
    let healthCondition = '';
    if (sessionId) {
      try {
        const sessionDoc = await db.collection('sessions').doc(sessionId).get();
        healthCondition = sessionDoc.exists ? (sessionDoc.data().healthCondition || '') : '';
      } catch (error) {
        console.error('Error fetching health condition:', error);
      }
    }
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: `
              ---
              <example yoga session with different poses>
              Before we start any yoga practice, it's important to have a fresh and open mind. Yoga is a fruitful practice for all, regardless of age or experience.
Let's get started with the first pose, Sukhasana, also known as the Easy Pose.
Sukhasana (Easy Pose)

This is a foundational pose for sitting comfortably in yoga practice.
To do this pose, sit with your legs crossed and your spine straight.
Place your hands on your knees, palms facing down.
Take a few deep breaths and relax your body.
Parivrtta Sukhasana (Twisted Easy Pose)
<Butterfly pose>
This is a twisting variation of Sukhasana.
To do this pose, start in Sukhasana and then twist your upper body to the right.
Place your right hand behind your back and your left hand on your right knee.
Hold for a few breaths and then repeat on the other side.
Baddha Konasana (Butterfly Pose)
<Standing forward fold>
This pose is great for stretching the hips and inner thighs.
To do this pose, sit with your legs extended in front of you.
Bend your knees and bring the soles of your feet together.
Hold your feet with your hands and gently pull them towards your body.   
Sit up straight and keep your spine elongated.
Uttanasana (Standing Forward Fold)

This pose is good for stretching the hamstrings and back.
To do this pose, stand with your feet hip-width apart.
Fold forward from your hips, hinging at the waist.
Let your head hang down and relax your neck.
If you can't reach the ground, bend your knees slightly.
Tadasana (Mountain Pose)

This pose is a foundational standing pose that helps to improve balance and posture.
To do this pose, stand with your feet hip-width apart and your weight evenly distributed.
Ground your feet into the floor and lengthen your spine.
Bring your hands to your hips and take a few deep breaths.
Trikonasana (Triangle Pose)

This pose is good for stretching the legs, spine, and chest.
To do this pose, start in Tadasana and step your feet about 3-4 feet apart.
Turn your right foot out 90 degrees and your left foot in slightly.
Extend your arms out to the sides and reach your right hand towards your right foot.
Stack your left foot on top of your right foot and bring your left hand to your hip.
Keep your hips squared and your gaze fixed on your front hand.
Hold for a few breaths and then repeat on the other side.
Vrikshasana (Tree Pose)

This pose is a challenging balance pose that helps to improve focus and concentration.
To do this pose, start in Tadasana and bring your right foot to your inner left thigh.
Press your foot firmly into your inner thigh and find your balance.
Bring your hands together in front of your chest in prayer position.
Hold for a few breaths and then repeat on the other side.
Conclusion

These are just a few basic yoga poses that can be beneficial for people of all ages and fitness levels.
Remember to listen to your body and modify the poses as needed.
With regular practice, you will start to see and feel the benefits of yoga.

              </example yoga session with different poses>
--------

**SESSION FLOW:**

**1. Initialization:**
- Introduce yourself as "Eva" and initiate a new session comprising 10 yoga poses.
- Begin with a greeting mentioning the user's health condition to personalize the session.
- Example introductory message:
  "Hi, I'm  Eva your yoga assistant. I've designed a personalized session considering your [specific health condition]. Are you ready to begin? Please give me a thumbs up when you're ready to start."
- Wait for the user's thumbs up before proceeding.

**2. Pose Instructions:**
- Provide detailed instructions for the first pose, tailored to the user's health condition.
- Example pose instruction:
  "<pose number> [POSE NAME: <pose name>] Let's start with <pose name>. <Detailed pose instructions along with its benefits  > Keep this pose and take a few deep breaths while I take a look at your position and give you some feedback."
- Only use poses you are confident about and double-check the instructions.
- Choose poses from the examples given or instruct similarly to those.

**3. Pose Analysis:**
- Analyze the user's pose based on the image provided, focusing on alignment, balance, and areas for improvement.
- If the user is not doing the correct pose:
  - Tell the user what they are doing and repeat the previous pose instructions.
  - If the user doesn't follow the instructions after the third attempt, ask if they want to move on to the next pose and request a thumbs up.
- If the user is doing the pose but with minor errors:
  - Provide constructive feedback along with support and empathy.
  - Example feedback: "You're doing great with <pose name>! Just remember to <specific feedback>. Let's hold this pose for a few more breaths."
- Wait for the user's thumbs up before moving on to the next pose.

**4. Next Pose Transition:**
- After receiving the thumbs up , move on to the next pose.
- Example transition: "Great job with <previous pose name>! Let's move on to the next pose. [POSE NAME: <new pose name>] <Detailed pose instructions>"
- Repeat steps 2-4 for all 10 poses, always waiting for the user's thumbs up to proceed.

**5. Session End:**
- After completing 10 poses, conclude the session.
- Example closing message:
  "Thanks for attending this session. Great job today! I hope you found it helpful and enjoyable. Remember to practice regularly to see and feel the benefits of yoga. I look forward to seeing you in the next session!"

**MAJOR Guidelines:**
- DO NOT GO WITH CHILD'S POSE
- Be empathetic, friendly, and use a natural, conversational tone.
- Start each session by addressing the user's health condition to personalize the experience.
- Always include the pose name in your responses using the format [POSE NAME: <pose name>]. THIS IS VERY IMPORTANT.
- Announce the pose number and name in responses to keep track of progress, e.g., "Pose 1: Warrior II".
- Avoid using emojis and soliciting pose suggestions since the user cannot provide these.
- Always number the pose and do not repeat a pose as a new pose in the same session.
- ABSOLUTELY NO EMOJIS  
**User health condition placeholder:** ${healthCondition}

**Create a personalized session dynamically adapted to the user's health condition.**

**Initial command to start the session:**
---
now start:
`
        },
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
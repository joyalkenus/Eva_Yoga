const express = require('express');
const { db } = require('../config/firebaseConfig');
const multer = require('multer');
const { generateResponse } = require('../services/geminiService');




const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();



router.post('/init', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.uid;

    console.log('Initializing session with:', { sessionId, userId });

    if (!sessionId || !userId) {
      throw new Error(`Missing required parameters: ${!sessionId ? 'sessionId' : ''} ${!userId ? 'userId' : ''}`);
    }

    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    if (sessionDoc.exists) {
      const messagesSnapshot = await db.collection('sessions').doc(sessionId).collection('messages').orderBy('timestamp', 'asc').limit(1).get();
      const initialMessage = messagesSnapshot.docs[0];
      if (initialMessage && initialMessage.data().role === 'assistant') {
        console.log('Session already initialized, returning existing response');
        return res.json({ responseText: initialMessage.data().content, poseName: initialMessage.data().poseName || 'Unknown Pose' });
      }
    }

    console.log('Generating initial response...');
    const { responseText, poseName, functionCall } = await generateResponse("Start a new yoga session", [], null, true);
    
    console.log('Generated initial response:', { responseText: responseText.substring(0, 50) + '...', poseName, functionCall });

    await saveChatMessage(sessionId, userId, 'assistant', responseText, poseName);

    res.json({ responseText, poseName, functionCall });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize session', details: error.message });
  }
});

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    const { sessionId, userInput } = req.body;
    const userId = req.user.uid;
    const image = req.files['image'] ? req.files['image'][0] : null;
    const audio = req.files['audio'] ? req.files['audio'][0] : null;

    console.log('Received chat request:', { sessionId, userId, userInput: userInput.substring(0, 50) + '...' });

    if (!sessionId || !userId || !userInput) {
      throw new Error('SessionId, userId, and userInput are required');
    }

    let processedUserInput = userInput;

    if (audio) {
      const transcription = await transcribeAudio(audio.buffer);
      processedUserInput = transcription;
    }

    const chatHistory = await getChatHistory(sessionId);

    await saveChatMessage(sessionId, userId, 'user', processedUserInput);

    console.log('Generating response for user input...');
    const { responseText, poseName, functionCall } = await generateResponse(processedUserInput, chatHistory, image, false);
    
    console.log('Generated response:', { responseText: responseText.substring(0, 50) + '...', poseName, functionCall });

    await saveChatMessage(sessionId, userId, 'assistant', responseText, poseName);

    res.json({ responseText, poseName, functionCall });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Failed to process chat', details: error.message });
  }
});



async function getChatHistory(sessionId) {
  try {
    const chatSnapshot = await db.collection('sessions').doc(sessionId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .limit(10)
      .get();

    return chatSnapshot.docs.map(doc => {
      const message = doc.data();
      return {
        role: message.role,
        content: message.content
      };
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

async function saveChatMessage(sessionId, userId, role, content, poseName = null) {
  console.log('Saving chat message:', { sessionId, userId, role, content: content.substring(0, 50) + '...', poseName });

  if (!sessionId || !userId || !role || !content) {
    throw new Error(`Missing required parameters for saveChatMessage: ${!sessionId ? 'sessionId' : ''} ${!userId ? 'userId' : ''} ${!role ? 'role' : ''} ${!content ? 'content' : ''}`);
  }

  try {
    const messageRef = db.collection('sessions').doc(sessionId).collection('messages');
    
    await messageRef.add({
      userId,
      role,
      content,
      poseName,
      timestamp: new Date()
    });

    await db.collection('sessions').doc(sessionId).update({
      lastUpdated: new Date()
    });

    console.log('Chat message saved successfully');
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

module.exports = router;
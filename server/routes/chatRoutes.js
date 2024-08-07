const express = require('express');
const { db } = require('../config/firebaseConfig');
const { generateResponse } = require('../services/geminiService');

const router = express.Router();

// Initialize session
router.post('/init', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.uid;

    console.log('Initializing session with:', { sessionId, userId });

    if (!sessionId || !userId) {
      throw new Error(`Missing required parameters: ${!sessionId ? 'sessionId' : ''} ${!userId ? 'userId' : ''}`);
    }

    // Generate initial response
    const { responseText, poseName } = await generateResponse("Start a new yoga session", []);
    
    console.log('Generated initial response:', { responseText: responseText.substring(0, 50) + '...', poseName });

    // Save the response to Firestore
    await saveChatMessage(sessionId, userId, 'assistant', responseText);

    res.json({ response: responseText, poseName });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize session', details: error.message });
  }
});

// Handle user input
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, userInput, image } = req.body;
    const userId = req.user.uid;

    console.log('Received chat request:', { sessionId, userId, userInput: userInput.substring(0, 50) + '...' });

    if (!sessionId || !userId || !userInput) {
      throw new Error('SessionId, userId, and userInput are required');
    }

    // Get the chat history for context
    const chatHistory = await getChatHistory(sessionId);

    // Save the user input to the database
    await saveChatMessage(sessionId, userId, 'user', userInput);

    // Generate response
    const { responseText, poseName } = await generateResponse(userInput, chatHistory, image);
    
    console.log('Generated response:', { responseText: responseText.substring(0, 50) + '...', poseName });

    // Save the response to Firestore
    await saveChatMessage(sessionId, userId, 'assistant', responseText);

    res.json({ response: responseText, poseName });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Failed to process chat', details: error.message });
  }
});

// Helper function to get chat history
async function getChatHistory(sessionId) {
  try {
    const chatSnapshot = await db.collection('sessions').doc(sessionId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
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

// Helper function to save chat message
async function saveChatMessage(sessionId, userId, role, content) {
  console.log('Saving chat message:', { sessionId, userId, role, content: content.substring(0, 50) + '...' });

  if (!sessionId || !userId || !role || !content) {
    throw new Error(`Missing required parameters for saveChatMessage: ${!sessionId ? 'sessionId' : ''} ${!userId ? 'userId' : ''} ${!role ? 'role' : ''} ${!content ? 'content' : ''}`);
  }

  try {
    const messageRef = db.collection('sessions').doc(sessionId).collection('messages');
    
    await messageRef.add({
      userId,
      role,
      content,
      timestamp: new Date()
    });

    // Update the session's lastUpdated field
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
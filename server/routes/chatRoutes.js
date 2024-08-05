const express = require('express');
const { db } = require('../config/firebaseConfig');
const { generateResponse, systemPrompt } = require('../services/geminiService');

const router = express.Router();

// Initialize session
router.post('/init', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.uid;

    // Save the system prompt to the database
    await saveChatMessage(sessionId, userId, 'system', systemPrompt);

    // Generate initial response
    const { responseText, poseName } = await generateResponse("Start a new yoga session", []);
    
    // Save the response to Firestore
    await saveChatMessage(sessionId, userId, 'assistant', responseText);

    res.json({ response: responseText, poseName });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize session' });
  }
});

// Handle user input
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, userInput, image } = req.body;
    const userId = req.user.uid;

    // Get the chat history for context
    const chatHistory = await getChatHistory(sessionId);

    // Save the user input to the database
    await saveChatMessage(sessionId, userId, 'user', userInput);

    // Generate response
    const { responseText, poseName } = await generateResponse(userInput, chatHistory, image);
    
    // Save the response to Firestore
    await saveChatMessage(sessionId, userId, 'assistant', responseText);

    res.json({ response: responseText, poseName });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// Helper function to get chat history
async function getChatHistory(sessionId) {
  const chatSnapshot = await db.collection('sessions').doc(sessionId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .get();

  const chatHistory = [];
  chatSnapshot.forEach(doc => {
    const message = doc.data();
    chatHistory.push({
      role: message.role,
      content: message.content
    });
  });

  return chatHistory;
}

// Helper function to save chat message
async function saveChatMessage(sessionId, userId, role, content) {
  await db.collection('sessions').doc(sessionId).collection('messages').add({
    userId,
    role,
    content,
    timestamp: new Date()
  });

  // Update the session's lastUpdated field
  await db.collection('sessions').doc(sessionId).update({
    lastUpdated: new Date()
  });
}

module.exports = router;
const express = require('express');
const { chatWithGemini } = require('../services/chatService');

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const { uid, name, email } = req.user;
    const response = await chatWithGemini(uid, message, name, email);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

module.exports = router;
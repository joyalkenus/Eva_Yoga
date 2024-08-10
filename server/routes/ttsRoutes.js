// server/routes/ttsRoutes.js
const express = require('express');
const { textToSpeech } = require('../services/ttsService');

const router = express.Router();

router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    const audioUrl = await textToSpeech(text);
    res.json({ audioUrl });
  } catch (error) {
    console.error('Error in TTS route:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

module.exports = router;
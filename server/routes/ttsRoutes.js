const express = require('express');
const { streamTextToSpeech } = require('../services/ttsService');

const router = express.Router();

router.post('/stream-tts', async (req, res) => {
  try {
    const { text } = req.body;
    const audioStream = await streamTextToSpeech(text);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    audioStream.pipe(res);

    audioStream.on('end', () => {
      res.end();
    });

    audioStream.on('error', (error) => {
      console.error('Error in audio stream:', error);
      res.status(500).json({ error: 'Error in audio stream' });
    });
  } catch (error) {
    console.error('Error in TTS route:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

module.exports = router;
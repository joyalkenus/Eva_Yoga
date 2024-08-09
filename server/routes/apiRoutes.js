const express = require('express');
const { transcribeAudio, generateResponse } = require('../services/geminiService');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-pose', upload.single('image'), async (req, res) => {
  try {
    const { pose } = req.body;
    const image = req.file;
    if (!image) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const analysis = await generateResponse(`Analyze this yoga pose: ${pose}`, [], image, false);
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing pose:', error);
    res.status(500).json({ error: 'Failed to analyze pose' });
  }
});

router.post('/transcribe', upload.single('audioData'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = req.file.buffer;
    const transcription = await transcribeAudio(audioBuffer);

    res.json({ text: transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Error transcribing audio' });
  }
});

module.exports = router;
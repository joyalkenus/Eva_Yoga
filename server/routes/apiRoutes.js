const express = require('express');
const { transcribeAudio, analyzePose } = require('../services/geminiService');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-pose', async (req, res) => {
  try {
    const { image, pose } = req.body;
    const analysis = await analyzePose(image, pose);
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
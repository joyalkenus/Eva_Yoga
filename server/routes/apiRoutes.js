const express = require('express');
const { getYogaInstruction, analyzePose } = require('../services/geminiService');

const router = express.Router();

router.get('/yoga-instruction', async (req, res) => {
  try {
    const instruction = await getYogaInstruction();
    res.json(instruction);
  } catch (error) {
    console.error('Error getting yoga instruction:', error);
    res.status(500).json({ error: 'Failed to get yoga instruction' });
  }
});

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

module.exports = router;
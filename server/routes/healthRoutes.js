const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseConfig');

router.post('/update-health-condition', async (req, res) => {
  try {
    const { sessionId, healthCondition } = req.body;
    
    if (!sessionId || !healthCondition) {
      return res.status(400).json({ error: 'SessionId and healthCondition are required' });
    }

    await db.collection('sessions').doc(sessionId).update({
      healthCondition: healthCondition
    });

    res.json({ success: true, message: 'Health condition updated successfully' });
  } catch (error) {
    console.error('Error updating health condition:', error);
    res.status(500).json({ error: 'Failed to update health condition' });
  }
});

module.exports = router;
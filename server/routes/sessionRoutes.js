const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseConfig');

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessionsSnapshot = await db.collection('sessions').where('userId', '==', req.user.uid).get();
    const sessions = [];
    sessionsSnapshot.forEach(doc => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    res.json(sessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// Create a new session
router.post('/', async (req, res) => {
  try {
    const newSession = {
      userId: req.user.uid,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    const docRef = await db.collection('sessions').add(newSession);
    res.status(201).json({ id: docRef.id, ...newSession });
  } catch (error) {
    console.error('Error creating new session:', error);
    res.status(500).json({ error: 'Failed to create new session' });
  }
});

module.exports = router;
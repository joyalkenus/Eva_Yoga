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

// Delete all sessions for a user
router.delete('/all', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get all sessions for the user
    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .get();

    // Delete each session and its messages
    const batch = db.batch();
    for (const doc of sessionsSnapshot.docs) {
      const sessionRef = db.collection('sessions').doc(doc.id);
      batch.delete(sessionRef);

      // Delete all messages in the session
      const messagesSnapshot = await sessionRef.collection('messages').get();
      messagesSnapshot.docs.forEach(messageDoc => {
        batch.delete(messageDoc.ref);
      });
    }

    // Commit the batch delete
    await batch.commit();

    res.json({ message: 'All sessions deleted successfully' });
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    res.status(500).json({ error: 'Failed to delete sessions' });
  }
});

module.exports = router;


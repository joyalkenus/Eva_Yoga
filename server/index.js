const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const { auth, db } = require('./config/firebaseConfig');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: 'http://localhost:3001', // Allow requests from your React app
  credentials: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
};

// API routes
app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/sessions', verifyToken, sessionRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const chatRoutes = require('./routes/chatRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const apiRoutes = require('./routes/apiRoutes');
const poseImageRoutes = require('./routes/poseImageRoutes'); // Adjusted import
const { auth } = require('./config/firebaseConfig');
const ttsRoutes = require('./routes/ttsRoutes');
const app = express();
const path = require('path');
const { streamTextToSpeech } = require('./services/ttsService');
const server = http.createServer(app);
const healthRoutes = require('./routes/healthRoutes');
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  transports: ['websocket']
});

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

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


app.use('/api', ttsRoutes);
app.use('/api/pose-image', poseImageRoutes); // Updated to point directly to the route
app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/sessions', verifyToken, sessionRoutes);
app.use('/api', apiRoutes);
app.use('/api', healthRoutes);
// Add this line after other middleware setups
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  await streamTextToSpeech(text, res);
});

// Add this catch-all route for debugging
app.use('*', (req, res) => {
  console.log(`Received request for ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId);
    console.log(`Client joined session: ${sessionId}`);
  });

  socket.on('tts-request', async (text) => {
    try {
      await streamTextToSpeech(text, socket);
    } catch (error) {
      console.error('Error in TTS request:', error);
      socket.emit('tts-error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
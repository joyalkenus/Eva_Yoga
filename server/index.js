const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');
const { auth, db } = require('./config/firebaseConfig');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
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

async function testFirestoreConnection() {
  try {
    const testDoc = await db.collection('test').doc('testDoc').set({ test: 'data' });
    console.log('Firestore connection successful');
    // Attempt to read the document back
    const readDoc = await db.collection('test').doc('testDoc').get();
    if (readDoc.exists) {
      console.log('Successfully read test document:', readDoc.data());
    } else {
      console.log('Test document does not exist after writing');
    }
  } catch (error) {
    console.error('Firestore connection failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.code === 5) {
      console.error('NOT_FOUND error. This could mean:');
      console.error('1. The "yoga" database does not exist in this project');
      console.error('2. Service account does not have necessary permissions for the "yoga" database');
      console.error('3. Incorrect project ID or database configuration');
    }
  }
}

// Call this function when your server starts
testFirestoreConnection();

// API routes
app.use('/api', verifyToken, chatRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
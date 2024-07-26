const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json'); // Adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'simple-bf503',
  databaseURL: 'https://simple-bf503-yoga.firebaseio.com'
});

const db = admin.firestore();

// Explicitly set the database ID
db.settings({
  projectId: 'simple-bf503',
  databaseId: 'yoga'
});

const auth = admin.auth();

module.exports = { admin, db, auth };
const { db } = require('../config/firebaseConfig');
const { generateResponse } = require('./geminiService');

async function getOrCreateUser(userId, name, email) {
    try {
      console.log('Attempting to get or create user:', userId);
      const usersCollection = db.collection('users');
      const userDoc = await usersCollection.doc(userId).get();
  
      if (!userDoc.exists) {
        console.log('User does not exist, creating new user');
        await usersCollection.doc(userId).set({
          name: name,
          email: email
        });
        console.log('New user created successfully');
      } else {
        console.log('User already exists');
      }
  
      return usersCollection.doc(userId);
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      if (error.code === 'permission-denied') {
        console.error('Firestore permission denied. Check your security rules and authentication.');
      }
      throw error;
    }
}
async function chatWithGemini(userId, userInput, name, email) {
    try {
        console.log('User Input:', userInput);

        const userRef = await getOrCreateUser(userId, name, email);

        let chatHistory = '';

        try {
            const recentChats = await userRef.collection('conversations')
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();

            chatHistory = recentChats.docs.reverse().map(doc => {
                const data = doc.data();
                return `User: ${data.userMessage}\nAI: ${data.aiResponse}`;
            }).join('\n\n');
        } catch (error) {
            console.error('Error retrieving chat history:', error);
            // Handle the case when the conversations subcollection doesn't exist or is empty
            chatHistory = 'No previous chat history found.';
        }

        const prompt = `Chat history:\n${chatHistory}\n\nUser: ${userInput}\nAI:`;

        const responseText = await generateResponse(prompt);
        console.log('AI Response:', responseText);

        await userRef.collection('conversations').add({
            timestamp: new Date(),
            userMessage: userInput,
            aiResponse: responseText
        });

        return responseText;
    } catch (error) {
        console.error('Error in chatWithGemini:', error);
        throw error;
    }
}

module.exports = { chatWithGemini };
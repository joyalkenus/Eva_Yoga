import axios from 'axios';

const API_BASE_URL = '/api/chat'; // Assuming this is the correct base URL for your chat API

export const initializeSession = async (sessionId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/init`, { sessionId });
    return response.data;
  } catch (error) {
    console.error('Error initializing session:', error);
    throw error;
  }
};

export const sendMessage = async (sessionId: string, userInput: string, image?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, { sessionId, userInput, image });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
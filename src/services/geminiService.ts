import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api'; // Make sure this matches your server port

export const initializeSession = async (sessionId: string): Promise<{ response: string; poseName: string }> => {
  const response = await axios.post(`${API_BASE_URL}/chat/init`, { sessionId });
  return response.data;
};

export const sendMessage = async (sessionId: string, userInput: string, image?: string): Promise<{ response: string; poseName: string }> => {
  const response = await axios.post(`${API_BASE_URL}/chat`, { sessionId, userInput, image });
  return response.data;
};
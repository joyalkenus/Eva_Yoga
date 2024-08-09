import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface GeminiResponse {
  responseText: string;
  poseName: string;
  functionCall?: {
    name: string;
    args: any;
  };
}

export const initializeSession = async (sessionId: string): Promise<GeminiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/init`, { sessionId });
    return response.data;
  } catch (error) {
    console.error('Error initializing session:', error);
    throw error;
  }
};

export const sendMessage = async (sessionId: string, userInput: string, image?: FormData): Promise<GeminiResponse> => {
  try {
    let response;
    if (image instanceof FormData) {
      response = await axios.post(`${API_BASE_URL}/chat`, image, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await axios.post(`${API_BASE_URL}/chat`, { sessionId, userInput });
    }
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};


export const sendUserFeedback = async (sessionId: string, feedback: string): Promise<GeminiResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/feedback`, { sessionId, feedback });
    return response.data;
  } catch (error) {
    console.error('Error sending user feedback:', error);
    throw new Error('Failed to send user feedback');
  }
};
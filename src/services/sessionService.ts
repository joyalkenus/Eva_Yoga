import axios from 'axios';

// In sessionService.ts
const API_BASE_URL = 'http://localhost:3000/api/sessions';

export const getSessions = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const createSession = async () => {
  try {
    const response = await axios.post(API_BASE_URL);
    console.log('Create session response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const deleteAllSessions = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    throw error;
  }
};
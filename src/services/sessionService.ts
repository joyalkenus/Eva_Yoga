import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/sessions'; // Update this line


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
    const response = await axios.delete('/api/sessions/all');
    return response.data;
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    throw error;
  }
};
// src/utils/speechUtils.ts
import axios from 'axios';
import { EventEmitter } from 'events';

export const speechEvents = new EventEmitter();

export const speak = async (text: string, onFinish?: () => void) => {
  console.log('Starting to speak:', text);
  try {
    const response = await axios.post('/api/tts', { text });
    const audioUrl = `${window.location.origin}${response.data.audioUrl}`;

    
    const audio = new Audio(audioUrl);
    
    audio.onloadedmetadata = () => {
      speechEvents.emit('speechStart');
    };
    
    audio.onended = () => {
      console.log('Speech ended');
      speechEvents.emit('speechEnd');
      if (onFinish) onFinish();
    };
    
    audio.onerror = (event) => {
      console.error('Audio playback error:', event);
      speechEvents.emit('speechEnd');
      if (onFinish) onFinish();
    };
    
    await audio.play();
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    speechEvents.emit('speechEnd');
    if (onFinish) onFinish();
  }
};
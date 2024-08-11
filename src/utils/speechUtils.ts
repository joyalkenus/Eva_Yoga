import { EventEmitter } from 'events';

export const speechEvents = new EventEmitter();

let isSpeaking = false;
const audio = new Audio();

export const speak = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isSpeaking) {
      console.log('Already speaking, please wait');
      reject(new Error('Speech in progress'));
      return;
    }

    console.log('Starting to speak:', text);
    isSpeaking = true;
    speechEvents.emit('speechStart');

    fetch('http://localhost:3000/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        audio.src = audioUrl;
        audio.onended = () => {
          console.log('Audio playback complete');
          URL.revokeObjectURL(audioUrl);
          isSpeaking = false;
          speechEvents.emit('speechEnd');
          resolve();
        };
        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          isSpeaking = false;
          speechEvents.emit('speechEnd');
          reject(error);
        };
        audio.play().catch(error => {
          console.error('Failed to play audio:', error);
          isSpeaking = false;
          speechEvents.emit('speechEnd');
          reject(error);
        });
      })
      .catch(error => {
        console.error('Error fetching audio:', error);
        isSpeaking = false;
        speechEvents.emit('speechEnd');
        reject(error);
      });
  });
};
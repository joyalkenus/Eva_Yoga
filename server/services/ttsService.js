// server/services/ttsService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);


const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // Choose a default voice ID

async function textToSpeech(text) {
  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      responseType: 'arraybuffer',
    });

    // Generate a unique filename
    const fileName = `speech_${Date.now()}.mp3`;
    const audioDir = path.join(__dirname, '..', 'public', 'audio');
    const filePath = path.join(audioDir, fileName);

    // Create the directory if it doesn't exist
    await mkdirAsync(audioDir, { recursive: true });

    // Save the audio file
    await writeFileAsync(filePath, response.data);


    // Return the URL to access this file
    return `/audio/${fileName}`;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
}

module.exports = { textToSpeech };
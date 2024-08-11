const { ElevenLabsClient } = require("elevenlabs");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

async function streamTextToSpeech(text, res) {
  try {
    const audioStream = await client.textToSpeech.convertAsStream(
      ELEVENLABS_VOICE_ID,
      {
        text: text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.9,
          similarity_boost: 0.5,
        },
      }
    );

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of audioStream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('Error in streaming text-to-speech conversion:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
}

module.exports = { streamTextToSpeech };
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const useSpeechToText = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);

  const processAudioData = useCallback(async () => {
    console.log('Processing audio data...');
    if (audioChunks.current.length === 0) {
      console.error('Error: No audio chunks collected');
      return;
    }
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    console.log(`Total audio size: ${audioBlob.size} bytes`);
    
    const formData = new FormData();
    formData.append('audioData', audioBlob);

    try {
      console.log('Sending audio data for transcription...');
      const response = await axiosInstance.post('/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Transcription response received:', response.data);
      if (response.data.text) {
        setText(response.data.text);
      } else {
        console.warn('Received empty transcription from server');
        setText('No speech detected');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setText('Error transcribing audio');
    } finally {
      audioChunks.current = [];
    }
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContext.current = new AudioContext();
        analyser.current = audioContext.current.createAnalyser();
        console.log('AudioContext and AnalyserNode created');

        if (analyser.current) {
          const source = audioContext.current.createMediaStreamSource(stream);
          source.connect(analyser.current);
          console.log('Audio source connected to analyser');

          const recorder = new MediaRecorder(stream, { 
            mimeType: 'audio/webm',
            audioBitsPerSecond: 128000
          });
          setMediaRecorder(recorder);

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              console.log(`Audio chunk received, size: ${e.data.size} bytes`);
              audioChunks.current.push(e.data);
            } else {
              console.warn('Received empty audio chunk');
            }
          };

          recorder.onstop = processAudioData;

          recorder.onerror = (event) => {
            console.error('Recorder error:', event);
            setIsListening(false);
          };

          recorder.onstart = () => {
            audioChunks.current = [];
            console.log('Recorder started, audio chunks reset');
          };

          const detectSilence = () => {
            const bufferLength = analyser.current?.fftSize || 2048;
            const dataArray = new Uint8Array(bufferLength);
            analyser.current?.getByteTimeDomainData(dataArray);

            const isSilent = dataArray.every(value => Math.abs(value - 128) < 5);

            if (isSilent) {
              if (silenceTimeout.current === null) {
                silenceTimeout.current = setTimeout(() => {
                  if (recorder.state !== 'inactive') {
                    console.log('Silence detected, stopping recording...');
                    recorder.stop();
                  }
                }, 3000);
              }
            } else {
              if (silenceTimeout.current) {
                clearTimeout(silenceTimeout.current);
                silenceTimeout.current = null;
              }
            }

            if (recorder.state !== 'inactive') {
              requestAnimationFrame(detectSilence);
            }
          };

          if (isListening) {
            recorder.start(100);
            console.log('Recording started...');
            detectSilence();
          }
        } else {
          console.error('AnalyserNode not created');
        }
      } catch (error) {
        console.error('Error setting up recording:', error);
        setIsListening(false);
      }
    };

    if (isListening) {
      setupRecording();
    }

    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('MediaRecorder stopped in cleanup');
      }
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      console.log('Cleanup completed');
    };
  }, [isListening, processAudioData]);

  const startListening = useCallback(() => {
    setText('');
    setIsListening(true);
    console.log('Starting to listen...');
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('Stopping listening...');
  }, []);

  return { text, isListening, startListening, stopListening };
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpeechToText } from '../services/speechToTextService';
import axios from 'axios';
import AnimatedSpeaker from '../components/AnimatedSpeaker';
import '../styles/PreperationPage.css';

const SPEECH_PAUSE_THRESHOLD = 1000; // 3 seconds

const PreparationPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [stage, setStage] = useState<'initial' | 'playing' | 'listening' | 'processing' | 'completed'>('initial');
  const audioRef = useRef<HTMLAudioElement>(null);
  const { text, startListening, stopListening } = useSpeechToText();
  const [isPlaying, setIsPlaying] = useState(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playAudio = useCallback(async (src: string) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      try {
        setIsPlaying(true);
        setStage('playing');
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  }, []);

  const handleAudioEnd = useCallback(() => {
    console.log('Audio ended');
    setIsPlaying(false);
    setStage('listening');
    startListening();
  }, [startListening]);

  const handleSpeechInput = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    speechTimeoutRef.current = setTimeout(() => {
      stopListening();
      setStage('processing');
    }, SPEECH_PAUSE_THRESHOLD);
  }, [stopListening]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleAudioEnd);
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, [handleAudioEnd]);

  useEffect(() => {
    if (stage === 'initial') {
      playAudio('/audio/ask_health_condition.mp3');
    } else if (stage === 'completed') {
      playAudio('/audio/thanks_lets_begin.mp3').then(() => {
        setTimeout(() => {
          if (sessionId) {
            navigate(`/yoga-session/${sessionId}`);
          }
        }, 3000);
      });
    }
  }, [stage, playAudio, navigate, sessionId]);

  useEffect(() => {
    if (text) {
      handleSpeechInput();
    }
  }, [text, handleSpeechInput]);

  useEffect(() => {
    if (stage === 'processing') {
      sendHealthConditionToBackend(text);
      setStage('completed');
    }
  }, [stage, text]);

  const sendHealthConditionToBackend = async (healthCondition: string) => {
    if (!sessionId || !healthCondition) return;
    try {
      await axios.post('/api/update-health-condition', { sessionId, healthCondition });
    } catch (error) {
      console.error('Error sending health condition:', error);
    }
  };

  const getStatusMessage = () => {
    switch (stage) {
      case 'playing':
        return 'AI is speaking...';
      case 'listening':
        return 'AI is listening...';
      case 'processing':
        return 'Processing your response...';
      default:
        return 'Waiting for your response';
    }
  };

  useEffect(() => {
    console.log(`Stage changed to: ${stage}, isPlaying: ${isPlaying}`);
  }, [stage, isPlaying]);

  return (
    <div className="preparation-container">
      <div className="glass-panel floating">
        <h1>Preparing Your Yoga Session</h1>
        <div className="preparation-speaker-container">
          <AnimatedSpeaker isPlaying={isPlaying || stage === 'listening'} />
        </div>
        <p className="preparation-status">
          {getStatusMessage()}
        </p>
        <audio ref={audioRef} />
      </div>
    </div>
  );
};

export default PreparationPage;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Camera, { CameraHandle } from '../components/Camera';
import { speak } from '../utils/speechUtils';
import { useSpeechToText } from '../services/speechToTextService';
import { GeminiResponse, initializeSession, sendMessage } from '../services/geminiService';
import '../styles/YogaSessionPage.css';

const YogaSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentPoseName, setCurrentPoseName] = useState<string>('');
  const [latestInstruction, setLatestInstruction] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const { text, isListening, startListening, stopListening } = useSpeechToText();
  const cameraRef = useRef<CameraHandle>(null);
  const isSpeakingRef = useRef(false);

  const processPoseInstruction = (response: string): string => {
    const poseNameRegex = /\[POSE NAME: (.*?)\]/;
    const match = response.match(poseNameRegex);
    if (match) {
      const poseName = match[1];
      setCurrentPoseName(poseName);
      return response.replace(`[POSE NAME: ${poseName}]`, '').trim();
    }
    return response;
  };

  const initSession = useCallback(async () => {
    if (!sessionId || isInitializedRef.current) return;
    console.log('Initializing session');
    isInitializedRef.current = true;
    try {
      const { response, poseName }: GeminiResponse = await initializeSession(sessionId);
      console.log('Initialization complete:', { response, poseName });
      const processedResponse = processPoseInstruction(response);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName);
      speakAndListen(processedResponse);
    } catch (error) {
      console.error("Error initializing session:", error);
      setError("Failed to initialize session. Please try again.");
    }
  }, [sessionId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const speakAndListen = useCallback((text: string) => {
    isSpeakingRef.current = true;
    speak(text, () => {
      isSpeakingRef.current = false;
      startListening();
    });
  }, [startListening]);

  const handleCapture = useCallback(async (imageSrc: string) => {
    if (isAnalyzing || !sessionId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const { response, poseName }: GeminiResponse = await sendMessage(sessionId, "Analyze my pose", imageSrc);
      const processedResponse = processPoseInstruction(response);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName);
      speakAndListen(processedResponse);
    } catch (error) {
      console.error("Error analyzing pose:", error);
      setError("Sorry, I couldn't analyze your pose at the moment. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, isAnalyzing, speakAndListen]);

  useEffect(() => {
    if (text && !isSpeakingRef.current && cameraRef.current) {
      cameraRef.current.captureImage();
    }
  }, [text]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="yoga-session-container">
      <div className="yoga-session-content">
        <div className="camera-container card">
          <h2>Camera Stream</h2>
          <Camera ref={cameraRef} onCapture={handleCapture} />
        </div>
        <div className="pose-suggestion-container card">
          <h2>Current Yoga Pose</h2>
          <div className="pose-image-placeholder">
            <img src={`https://source.unsplash.com/400x300/?yoga,${currentPoseName}`} alt={`Yoga pose: ${currentPoseName}`} />
          </div>
          <p>Current Pose: {currentPoseName}</p>
        </div>
      </div>
      <div className="instructions-container card">
        <h2>AI Instructions</h2>
        <p>{latestInstruction}</p>
      </div>
      <div className="feedback-container card">
        <h2>Your Feedback</h2>
        <p>{isListening ? 'Listening...' : (isSpeakingRef.current ? 'AI is speaking...' : 'Waiting for your response')}</p>
      </div>
    </div>
  );
};

export default YogaSessionPage;
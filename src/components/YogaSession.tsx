import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Camera from '../components/Camera';
import { speak } from '../utils/speechUtils';
import '../styles/YogaSessionPage.css';

interface YogaSessionPageProps {
  initializeSession: (sessionId: string) => Promise<{ response: string; poseName: string }>;
  sendMessage: (sessionId: string, userInput: string, image?: string) => Promise<{ response: string; poseName: string }>;
}

const YogaSessionPage: React.FC<YogaSessionPageProps> = ({ initializeSession, sendMessage }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentPoseName, setCurrentPoseName] = useState<string>('');
  const [latestInstruction, setLatestInstruction] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPoseInstruction = (response: string): string => {
    const poseNameRegex = /\[POSE NAME: (.*?)\]/;
    const match = response.match(poseNameRegex);
    if (match) {
      const poseName = match[1];
      return response.replace(`**[POSE NAME: ${poseName}]**`, '').trim();
    }
    return response;
  };

  const initSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { response, poseName } = await initializeSession(sessionId);
      const processedResponse = processPoseInstruction(response);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName);
    } catch (error) {
      console.error("Error initializing session:", error);
      setError("Failed to initialize session. Please try again.");
    }
  }, [sessionId, initializeSession]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    window.speechSynthesis.cancel();
    const timer = setTimeout(() => {
      speak(latestInstruction);
    }, 100);
    return () => clearTimeout(timer);
  }, [latestInstruction]);

  const handleCapture = async (imageSrc: string) => {
    if (isAnalyzing || !sessionId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const { response, poseName } = await sendMessage(sessionId, "Analyze my pose", imageSrc);
      const processedResponse = processPoseInstruction(response);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName);
    } catch (error) {
      console.error("Error analyzing pose:", error);
      setError("Sorry, I couldn't analyze your pose at the moment. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="yoga-session-container">
      <div className="yoga-session-content">
        <div className="camera-container card">
          <h2>Camera Stream Capture</h2>
          <Camera onCapture={handleCapture} />
        </div>
        <div className="pose-suggestion-container card">
          <h2>REAL YOGA POSE IMAGE</h2>
          <div className="pose-image-placeholder">
            <img src={`https://source.unsplash.com/400x300/?yoga,${currentPoseName}`} alt={`Yoga pose: ${currentPoseName}`} />
          </div>
          <p>Current Pose: {currentPoseName}</p>
        </div>
      </div>
      <div className="instructions-container card">
        <h2>LATEST GEMINI INSTRUCTIONS</h2>
        <p>{latestInstruction}</p>
      </div>
    </div>
  );
};

export default YogaSessionPage;
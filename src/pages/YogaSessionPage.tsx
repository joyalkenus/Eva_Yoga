import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Camera, { CameraHandle } from '../components/Camera';
import { speak } from '../utils/speechUtils';
import { useSpeechToText } from '../services/speechToTextService';
import { GeminiResponse, initializeSession, sendMessage } from '../services/geminiService';
import '../styles/YogaSessionPage.css';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import AnimatedSpeaker from '../components/AnimatedSpeaker';

const YogaSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [currentPoseName, setCurrentPoseName] = useState<string>('');
  const [latestInstruction, setLatestInstruction] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const { text, isListening, startListening, stopListening } = useSpeechToText();
  const cameraRef = useRef<CameraHandle>(null);
  const isSpeakingRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const [poseImageUrl, setPoseImageUrl] = useState<string | null>(null);

 
  const fetchPoseImage = async (poseName: string): Promise<void> => {
    try {
      // Concatenate "Yoga pose" with the actual pose name for better search results
      const query = `Yoga pose ${poseName}`;
      const response = await fetch(`/api/pose-image?poseName=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setPoseImageUrl(data.imageUrl);
      } else {
        setPoseImageUrl(null);
        console.warn('No images found for pose:', poseName);
      }
    } catch (error) {
      console.error('Error fetching pose image:', error);
      setPoseImageUrl(null);
    }
  };
   const processPoseInstruction = (response: string): string => {
    const poseNameRegex = /\[POSE NAME: (.*?)\]/;
    const match = response.match(poseNameRegex);
    if (match) {
      const poseName = match[1];
      setCurrentPoseName(poseName);
      fetchPoseImage(poseName); // Fetch the image for the current pose
      return response.replace(`[POSE NAME: ${poseName}]`, '').trim();
    }
    return response;
  };
  const initSession = useCallback(async () => {
    if (!sessionId || isInitializedRef.current) return;
    console.log('Initializing session');
    isInitializedRef.current = true;
    try {
      const { responseText, poseName }: GeminiResponse = await initializeSession(sessionId);
      console.log('Initialization complete:', { responseText, poseName });
      const processedResponse = processPoseInstruction(responseText);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName || 'Unknown Pose');
      speakAndListen(processedResponse);
    } catch (error) {
      console.error("Error initializing session:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      setError("Failed to initialize session. Please try again.");
    }
  }, [sessionId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (sessionId) {
      socketRef.current = io('http://localhost:3000');
      socketRef.current.emit('joinSession', sessionId);

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [sessionId]);

  const speakAndListen = useCallback((text: string) => {
    isSpeakingRef.current = true;
    speak(text, () => {
      isSpeakingRef.current = false;
      if (cameraRef.current) {
        cameraRef.current.captureImage();
      }
    });
  }, []);

  const handleCapture = useCallback(async (imageSrc: string) => {
    if (isAnalyzing || !sessionId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'pose.jpg');
      formData.append('sessionId', sessionId);
      formData.append('userInput', 'Analyze my pose');

      const { responseText, poseName, functionCall }: GeminiResponse = await sendMessage(sessionId, "Analyze my pose", formData);
      const processedResponse = processPoseInstruction(responseText);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName || 'Unknown Pose');

      if (functionCall) {
        if (functionCall.name === 'captureAndAnalyzePose') {
          if (cameraRef.current) {
            cameraRef.current.captureImage();
          }
        } else if (functionCall.name === 'listenToUserResponse') {
          startListening();
        }
      } else {
        speakAndListen(processedResponse);
      }
    } catch (error) {
      console.error("Error analyzing pose:", error);
      setError("Sorry, I couldn't analyze your pose at the moment. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, isAnalyzing, speakAndListen, startListening]);

  const handleUserResponse = useCallback(async (userResponse: string) => {
    if (!sessionId) return;
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('userInput', userResponse);

      const { responseText, poseName, functionCall }: GeminiResponse = await sendMessage(sessionId, userResponse, formData);
      const processedResponse = processPoseInstruction(responseText);
      setLatestInstruction(processedResponse);
      setCurrentPoseName(poseName || 'Unknown Pose');

      if (functionCall) {
        if (functionCall.name === 'captureAndAnalyzePose') {
          if (cameraRef.current) {
            cameraRef.current.captureImage();
          }
        } else if (functionCall.name === 'listenToUserResponse') {
          startListening();
        }
      } else {
        speakAndListen(processedResponse);
      }
    } catch (error) {
      console.error("Error processing user response:", error);
      setError("Sorry, I couldn't process your response. Please try again.");
    }
  }, [sessionId, speakAndListen, startListening]);

  useEffect(() => {
    if (text && !isSpeakingRef.current) {
      handleUserResponse(text);
    }
  }, [text, handleUserResponse]);

  const instructionsRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (instructionsRef.current) {
      const container = instructionsRef.current.parentElement;
      if (container) {
        let fontSize = 1;
        while (container.scrollHeight > container.clientHeight && fontSize > 0.5) {
          fontSize -= 0.05;
          instructionsRef.current.style.fontSize = `${fontSize}rem`;
        }
      }
    }
  }, [latestInstruction]);

  if (!sessionId) {
    return <div className="error-message">No session ID provided.</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="yoga-session-container">
      <div className="camera-container card">
        <h2>Camera Stream</h2>
        <Camera ref={cameraRef} onCapture={handleCapture} />
      </div>
      <div className="pose-suggestion-container card">
        <h2>Current Yoga Pose</h2>
        <div className="pose-image-placeholder">
          {poseImageUrl ? (
            <img src={poseImageUrl} alt={`Yoga pose: ${currentPoseName}`} />
          ) : (
            <p>Loading image...</p>
          )}
        </div>
        <p>Current Pose: {currentPoseName}</p>
      </div>
      <div className="instructions-container card">
        <h2>Yoga Instructions</h2>
        <p ref={instructionsRef}>{latestInstruction}</p>
      </div>
      <div className="ai-feedback-container">
        <AnimatedSpeaker isPlaying={isSpeakingRef.current} />
        <p className="ai-status">
          {isListening ? 'Listening...' : (isSpeakingRef.current ? 'AI is speaking...' : 'Waiting for your response')}
        </p>
      </div>
    </div>
  );
};

export default YogaSessionPage;


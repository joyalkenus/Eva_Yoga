import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Camera from './Camera';
import PoseSuggestion from './PoseSuggestion';
import { initializeSession, sendMessage } from '../services/geminiService';
import { speak } from '../utils/speechUtils';

const YogaSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
  const [currentPoseName, setCurrentPoseName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (role: string, content: string) => {
    setMessages(prevMessages => [...prevMessages, { role, content }]);
  };

  const initSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { response, poseName } = await initializeSession(sessionId);
      addMessage('assistant', response);
      setCurrentPoseName(poseName);
      speak(response);
    } catch (error) {
      console.error("Error initializing session:", error);
      setError("Failed to initialize session. Please try again.");
    }
  }, [sessionId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleUserInput = async (userInput: string) => {
    addMessage('user', userInput);
    try {
      const { response, poseName } = await sendMessage(sessionId!, userInput);
      addMessage('assistant', response);
      setCurrentPoseName(poseName);
      speak(response);
    } catch (error) {
      console.error("Error processing user input:", error);
      setError("Failed to process your input. Please try again.");
    }
  };

  const handleCapture = async (imageSrc: string) => {
    if (isAnalyzing || !sessionId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const { response, poseName } = await sendMessage(sessionId, "Analyze my pose", imageSrc);
      addMessage('assistant', response);
      setCurrentPoseName(poseName);
      speak(response);
    } catch (error) {
      console.error("Error analyzing pose:", error);
      setError("Sorry, I couldn't analyze your pose at the moment. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="yoga-session">
      <h1>Yoga Session</h1>
      <div className="message-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <Camera onCapture={handleCapture} />
      <PoseSuggestion 
        poseName={currentPoseName}
        isAnalyzing={isAnalyzing}
      />
      <input 
        type="text" 
        placeholder="Type your message here..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleUserInput(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
      />
    </div>
  );
};

export default YogaSession;
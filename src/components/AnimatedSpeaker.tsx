import React, { useEffect, useRef, useState } from 'react';
import './AnimatedSpeaker.css';

const AnimatedSpeaker: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const [amplitude, setAmplitude] = useState(0);
  const requestRef = useRef<number>();

  const animate = () => {
    if (isPlaying) {
      setAmplitude(Math.sin(Date.now() / 100) * 0.5 + 0.5);
    } else {
      setAmplitude(0);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying]);

  const size = 50 + amplitude * 20;
  const mainColor = `rgba(255, 255, 255, ${0.7 + amplitude * 0.3})`;
  const pulseColor = `rgba(110, 0, 255, ${0.5 + amplitude * 0.5})`;

  return (
    <div className="animated-speaker">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={size / 2}
          fill={mainColor}
          filter="url(#glow)"
        />
        <circle
          cx="50"
          cy="50"
          r={(size / 2) * 0.8}
          fill="transparent"
          stroke={pulseColor}
          strokeWidth="2"
          filter="url(#glow)"
        >
          <animate attributeName="r" values={`${(size/2)*0.7};${(size/2)*0.9};${(size/2)*0.7}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle
          cx="50"
          cy="50"
          r={(size / 2) * 0.6}
          fill="transparent"
          stroke={pulseColor}
          strokeWidth="2"
          filter="url(#glow)"
        >
          <animate attributeName="r" values={`${(size/2)*0.5};${(size/2)*0.7};${(size/2)*0.5}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default AnimatedSpeaker;
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './AnimatedSpeaker.css';

interface AnimatedSpeakerProps {
  isPlaying: boolean;
}

const AnimatedSpeaker: React.FC<AnimatedSpeakerProps> = ({ isPlaying }) => {
  const controls = useAnimation();
  const requestRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      const scale = isPlaying 
        ? 1 + Math.sin(time * 4) * 0.1 
        : 1 + Math.sin(time * 2) * 0.05;

      controls.set({ scale });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, controls]);

  return (
    <div className="animated-speaker">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <radialGradient id="speakerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0.2" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="url(#speakerGradient)"
          filter="url(#glow)"
          animate={controls}
        />
        <motion.circle
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          strokeDasharray="0 1"
          animate={{
            rotate: [0, 360],
            strokeDasharray: isPlaying ? ["1 0", "0 1"] : ["0 1", "0 1"],
          }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            strokeDasharray: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
          }}
        />
      </svg>
    </div>
  );
};

export default AnimatedSpeaker;

import React from 'react';

interface PoseSuggestionProps {
  poseName: string;
  isAnalyzing: boolean;
}

const PoseSuggestion: React.FC<PoseSuggestionProps> = ({ poseName, isAnalyzing }) => {
  return (
    <div className="pose-suggestion">
      <h2>Current Pose: {poseName}</h2>
      {isAnalyzing && <p>Analyzing your pose...</p>}
    </div>
  );
};

export default PoseSuggestion;
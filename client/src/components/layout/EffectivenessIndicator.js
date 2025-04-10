// src/components/layout/EffectivenessIndicator.js
import React from 'react';

const EffectivenessIndicator = ({ effectiveness }) => {
  let className = '';
  
  switch (effectiveness) {
    case 'Effective':
      className = 'effective';
      break;
    case 'Neutral':
      className = 'neutral';
      break;
    case 'Ineffective':
      className = 'ineffective';
      break;
    default:
      className = '';
  }
  
  return <span className={className}>{effectiveness}</span>;
};

export default EffectivenessIndicator;
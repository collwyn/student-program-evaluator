// src/components/layout/PerformanceIndicator.js
import React from 'react';

const PerformanceIndicator = ({ performance }) => {
  let className = '';
  
  switch (performance) {
    case 'Improved':
      className = 'improved';
      break;
    case 'Neutral':
      className = 'neutral';
      break;
    case 'Struggled':
      className = 'struggled';
      break;
    default:
      className = '';
  }
  
  return <span className={className}>{performance}</span>;
};

export default PerformanceIndicator;
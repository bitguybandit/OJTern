import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

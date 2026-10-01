import React from 'react';

export default function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

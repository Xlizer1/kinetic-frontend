import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div style={{ width: size, height: size, border: '2px solid var(--bg-elevated)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', boxShadow: '0 0 8px var(--accent-dim)' }} />
);

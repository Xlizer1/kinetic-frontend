import React from 'react';

interface ErrorMessageProps { message: string; onRetry?: () => void; }

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0, fontWeight: 500 }}>{message}</p>
    {onRetry && <button onClick={onRetry} style={{ padding: '4px 14px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Retry</button>}
  </div>
);

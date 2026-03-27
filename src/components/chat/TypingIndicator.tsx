import React from 'react';

interface TypingIndicatorProps { usernames: string[]; }

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ usernames }) => {
  if (!usernames.length) return <div style={{ height: 24 }} />;

  const text = usernames.length === 1 ? `${usernames[0]} is typing...`
    : usernames.length === 2 ? `${usernames[0]} and ${usernames[1]} are typing...`
    : 'Several people are typing...';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 18px', height: 24 }}>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`, display: 'inline-block', boxShadow: '0 0 4px var(--accent-dim)' }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{text}</span>
    </div>
  );
};

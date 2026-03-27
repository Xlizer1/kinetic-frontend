import React, { useState } from 'react';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

interface MessageInputProps { channelId: number; onSend: (content: string) => void; channelName: string; }

export const MessageInput: React.FC<MessageInputProps> = ({ channelId, onSend, channelName }) => {
  const [value, setValue] = useState('');
  const { startTyping, stopTyping } = useTypingIndicator(channelId);

  const handleSend = () => { const t = value.trim(); if (!t) return; onSend(t); setValue(''); stopTyping(); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } else { startTyping(); }
  };

  const hasValue = value.trim().length > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 18px 16px', background: 'var(--bg-secondary)' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          style={{
            width: '100%', padding: '11px 14px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.45,
            resize: 'none', minHeight: 42, maxHeight: 140,
            fontFamily: 'var(--font-sans)',
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!hasValue}
        style={{
          width: 42, height: 42, flexShrink: 0,
          background: hasValue ? 'linear-gradient(135deg, var(--accent), #0891b2)' : 'var(--bg-tertiary)',
          color: hasValue ? 'var(--text-inverse)' : 'var(--text-muted)',
          border: hasValue ? 'none' : '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', fontSize: 16, cursor: hasValue ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hasValue ? '0 2px 12px rgba(34,211,238,0.3)' : 'none',
          transition: 'all var(--duration-normal) var(--ease-out)',
        }}
      >➤</button>
    </div>
  );
};

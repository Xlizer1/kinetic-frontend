import React, { useState } from 'react';
import { Message } from '../../types/message';
import { UserAvatar } from '../user/UserAvatar';
import { formatTimestamp, sanitizeContent } from '../../utils/helpers';

interface MessageItemProps { message: Message; isOwn: boolean; onDelete?: (messageId: number) => void; }

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: 14, padding: '8px 18px', position: 'relative',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        transition: 'background var(--duration-fast) var(--ease-out)',
      }}
    >
      <UserAvatar username={message.author.username} avatarUrl={message.author.avatar_url || undefined} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: isOwn ? 'var(--accent-text)' : 'var(--text-primary)', letterSpacing: '-0.1px' }}>{message.author.username}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{formatTimestamp(message.created_at)}</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, margin: '3px 0 0', wordBreak: 'break-word', fontWeight: 400, opacity: 0.9 }} dangerouslySetInnerHTML={{ __html: sanitizeContent(message.content) }} />
      </div>

      {/* Hover action */}
      {hovered && isOwn && onDelete && (
        <button
          onClick={() => onDelete(message.id)}
          title="Delete message"
          style={{
            position: 'absolute', top: 6, right: 12,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
            color: 'var(--text-muted)', fontSize: 11, padding: '3px 8px',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            animation: 'fadeIn 0.15s var(--ease-out)',
          }}
        >✕</button>
      )}
    </div>
  );
};

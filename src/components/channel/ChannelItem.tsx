import React, { useState } from 'react';
import { Channel } from '../../types/channel';

interface ChannelItemProps { channel: Channel; active: boolean; onClick: () => void; }

export const ChannelItem: React.FC<ChannelItemProps> = ({ channel, active, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const icon = channel.type === 'voice' ? '🔊' : '#';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px',
        border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 14,
        textAlign: 'left' as const, fontWeight: active ? 600 : 400,
        background: active ? 'var(--bg-active)' : hovered ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
        transition: 'all var(--duration-fast) var(--ease-out)',
        position: 'relative',
      }}
    >
      {active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, background: 'var(--accent)', borderRadius: '0 2px 2px 0', boxShadow: '0 0 6px var(--accent-dim)' }} />}
      <span style={{ fontSize: 16, opacity: active ? 0.9 : 0.45, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channel.name}</span>
    </button>
  );
};

import React, { useState } from 'react';
import { Server } from '../../types/server';
import { getInitials } from '../../utils/helpers';

interface ServerIconProps { server: Server; active: boolean; onClick: () => void; }

const hashHue = (str: string): number => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return (h & 0xff) % 360; };

export const ServerIcon: React.FC<ServerIconProps> = ({ server, active, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const hue = hashHue(server.name);
  const isRound = !active && !hovered;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Active indicator pill */}
      <div style={{ position: 'absolute', left: -4, width: 4, height: active ? 36 : hovered ? 20 : 0, background: 'var(--accent)', borderRadius: '0 4px 4px 0', transition: 'height 0.25s var(--ease-spring)', boxShadow: active ? '0 0 8px var(--accent-dim)' : 'none' }} />
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={server.name}
        style={{
          width: 48, height: 48,
          borderRadius: isRound ? '50%' : '14px',
          border: 'none', cursor: 'pointer',
          background: active ? `linear-gradient(135deg, var(--accent), #0891b2)` : server.icon_url ? 'transparent' : `linear-gradient(135deg, hsl(${hue},50%,30%), hsl(${(hue + 30) % 360},60%,22%))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-radius 0.3s var(--ease-spring), background 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out)',
          overflow: 'hidden',
          boxShadow: active ? 'var(--shadow-glow)' : hovered ? '0 0 12px rgba(255,255,255,0.06)' : 'none',
        }}
      >
        {server.icon_url ? (
          <img src={server.icon_url} alt={server.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 16, fontWeight: 700, color: active ? 'var(--text-inverse)' : '#ffffffcc', userSelect: 'none', letterSpacing: '0.3px' }}>{getInitials(server.name)}</span>
        )}
      </button>
    </div>
  );
};

import React from 'react';
import { getInitials } from '../../utils/helpers';

interface UserAvatarProps { username: string; avatarUrl?: string; size?: number; showStatus?: boolean; status?: string; }

const STATUS_COLORS: Record<string, string> = { online: '#34d399', idle: '#fbbf24', dnd: '#f43f5e', offline: '#4e5364' };

// Deterministic gradient from username
const hashColor = (str: string): [string, string] => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  const h1 = ((h & 0xff) % 360);
  return [`hsl(${h1}, 60%, 45%)`, `hsl(${(h1 + 40) % 360}, 70%, 35%)`];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ username, avatarUrl, size = 36, showStatus = false, status = 'offline' }) => {
  const initials = getInitials(username);
  const [c1, c2] = hashColor(username);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} style={{ width: size, height: size, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: 'var(--radius-md)', background: `linear-gradient(135deg, ${c1}, ${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.max(size * 0.36, 10), fontWeight: 700, color: '#fff', userSelect: 'none', letterSpacing: '0.5px' }}>
          {initials}
        </div>
      )}
      {showStatus && (
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: size * 0.3, height: size * 0.3, borderRadius: '50%', background: STATUS_COLORS[status] || STATUS_COLORS.offline, border: '2.5px solid var(--bg-secondary)', boxShadow: status === 'online' ? '0 0 6px rgba(52,211,153,0.4)' : 'none' }} />
      )}
    </div>
  );
};

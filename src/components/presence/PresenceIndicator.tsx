import React from 'react';

const COLORS: Record<string, string> = { online: '#34d399', idle: '#fbbf24', dnd: '#f43f5e', offline: '#4e5364' };
const LABELS: Record<string, string> = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };

export const PresenceIndicator: React.FC<{ status: string; size?: number }> = ({ status, size = 8 }) => {
  const color = COLORS[status] || COLORS.offline;
  return (
    <span title={LABELS[status] || 'Offline'} style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: status === 'online' ? `0 0 6px ${color}60` : 'none' }} />
  );
};

import React from 'react';
import { usePresence } from '../../context/PresenceContext';
import { UserAvatar } from '../user/UserAvatar';
import { PresenceIndicator } from './PresenceIndicator';

interface MemberListProps { members: Array<{ user_id: number; username: string; avatar_url?: string; role: string }>; }

export const MemberList: React.FC<MemberListProps> = ({ members }) => {
  const { getStatus } = usePresence();
  const online = members.filter((m) => { const s = getStatus(m.user_id); return s === 'online' || s === 'idle' || s === 'dnd'; });
  const offline = members.filter((m) => getStatus(m.user_id) === 'offline');

  const renderSection = (title: string, list: typeof members) => {
    if (!list.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', padding: '0 10px', marginBottom: 6 }}>{title} — {list.length}</div>
        {list.map((m) => (
          <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 'var(--radius-sm)', cursor: 'default', transition: 'background var(--duration-fast)' }}>
            <UserAvatar username={m.username} avatarUrl={m.avatar_url} size={30} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{m.username}</span>
              {m.role !== 'member' && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '1px 6px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{m.role}</span>}
            </div>
            <PresenceIndicator status={getStatus(m.user_id)} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: 220, height: '100%', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', borderBottom: '1px solid var(--border)' }}>Members</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {renderSection('Online', online)}
        {renderSection('Offline', offline)}
        {!members.length && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>No members</p>}
      </div>
    </div>
  );
};

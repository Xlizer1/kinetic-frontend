import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePresence } from '../../context/PresenceContext';
import { UserAvatar } from './UserAvatar';
import { PresenceIndicator } from '../presence/PresenceIndicator';
import { EditProfileModal } from './EditProfileModal';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { getStatus } = usePresence();
  const [showEdit, setShowEdit] = useState(false);

  if (!user) return null;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-deepest)', borderTop: '1px solid var(--border)' }}>
        <div onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flex: 1, minWidth: 0 }}>
          <UserAvatar username={user.username} avatarUrl={user.avatar_url || undefined} size={32} />
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PresenceIndicator status={getStatus(user.id)} size={6} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' as const }}>{getStatus(user.id)}</span>
            </div>
          </div>
        </div>
        <button onClick={logout} title="Sign out" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13, padding: '5px 8px', borderRadius: 'var(--radius-sm)' }}>⏻</button>
      </div>
      <EditProfileModal open={showEdit} onClose={() => setShowEdit(false)} />
    </>
  );
};

import React, { useEffect, useRef } from 'react';
import { VoiceUser } from '../../types/voice';
import { UserAvatar } from '../user/UserAvatar';

interface VoiceUserListProps { users: VoiceUser[]; localUsername: string; isMuted: boolean; }

const RemoteAudio: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return <audio ref={ref} autoPlay playsInline />;
};

const UserCard: React.FC<{ username: string; status: string; speaking?: boolean; children?: React.ReactNode }> = ({ username, status, speaking, children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 24px',
    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', minWidth: 130,
    border: speaking ? '1px solid var(--accent)' : '1px solid var(--border)',
    boxShadow: speaking ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
    animation: 'fadeInScale 0.3s var(--ease-spring)',
    transition: 'border-color var(--duration-normal), box-shadow var(--duration-normal)',
  }}>
    <UserAvatar username={username} size={52} />
    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>{username}</span>
    <span style={{ fontSize: 11, color: speaking ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>{status}</span>
    {children}
  </div>
);

export const VoiceUserList: React.FC<VoiceUserListProps> = ({ users, localUsername, isMuted }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: 28 }}>
    <UserCard username={localUsername} status={isMuted ? '🔇 Muted' : '🎙 Speaking'} speaking={!isMuted} />
    {users.map((u) => (
      <UserCard key={u.userId} username={u.username} status="Connected">
        {u.stream && <RemoteAudio stream={u.stream} />}
      </UserCard>
    ))}
    {!users.length && <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '10px 0' }}>Waiting for others to join...</p>}
  </div>
);

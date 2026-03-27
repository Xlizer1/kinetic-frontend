import React from 'react';
import { Channel } from '../../types/channel';
import { useAuth } from '../../context/AuthContext';
import { useVoice } from '../../context/VoiceContext';
import { VoiceControls } from './VoiceControls';
import { VoiceUserList } from './VoiceUserList';

interface VoiceChannelProps { channel: Channel; }

export const VoiceChannel: React.FC<VoiceChannelProps> = ({ channel }) => {
  const { user } = useAuth();
  const { channelId: activeVC, remoteUsers, isMuted, joinVoice, leaveVoice } = useVoice();
  const isHere = activeVC === channel.id;
  const isElsewhere = activeVC !== null && activeVC !== channel.id;

  const handleJoin = async () => { try { if (isElsewhere) leaveVoice(); await joinVoice(channel.id); } catch { /* mic denied */ } };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <span style={{ fontSize: 18 }}>🔊</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{channel.name}</span>
        {channel.topic && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border-strong)', margin: '0 4px' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{channel.topic}</span>
          </>
        )}
        {isHere && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--success)', background: 'var(--success-dim)', padding: '3px 10px', borderRadius: 'var(--radius-full)', letterSpacing: '0.3px' }}>CONNECTED</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow */}
        {isHere && <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', opacity: 0.3, animation: 'pulseGlow 3s ease-in-out infinite' }} />}

        {isHere ? (
          <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            <VoiceUserList users={remoteUsers} localUsername={user?.username || ''} isMuted={isMuted} />
            <VoiceControls />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, animation: 'fadeIn 0.4s var(--ease-out)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, var(--accent-dim), rgba(8,145,178,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '1px solid var(--border)' }}>🎙</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{channel.name}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300, lineHeight: 1.5 }}>
              {isElsewhere ? "You're in another voice channel. Join to switch." : 'Click below to join this voice channel.'}
            </p>
            <button onClick={handleJoin} style={{ padding: '13px 36px', background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 20px rgba(34,211,238,0.3)', letterSpacing: '0.3px' }}>
              {isElsewhere ? 'Switch Channel' : 'Join Voice'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

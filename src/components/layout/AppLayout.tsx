import React, { useState, useCallback } from 'react';
import { Server } from '../../types/server';
import { Channel } from '../../types/channel';
import { Sidebar } from './Sidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { Chat } from '../chat/Chat';
import { VoiceChannel } from '../voice/VoiceChannel';

export const AppLayout: React.FC = () => {
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  const handleSelectServer = useCallback((server: Server | null) => { setActiveServer(server); setActiveChannel(null); }, []);
  const handleSelectChannel = useCallback((channel: Channel) => { setActiveChannel(channel); }, []);
  const handleServerUpdated = useCallback((server: Server) => { setActiveServer(server); }, []);
  const handleServerDeleted = useCallback(() => { setActiveServer(null); setActiveChannel(null); }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-deepest)' }}>
      <Sidebar activeServerId={activeServer?.id ?? null} onSelectServer={handleSelectServer} />

      {activeServer && (
        <ChannelSidebar
          server={activeServer}
          activeChannelId={activeChannel?.id ?? null}
          onSelectChannel={handleSelectChannel}
          onServerUpdated={handleServerUpdated}
          onServerDeleted={handleServerDeleted}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-primary)' }}>
        {activeChannel ? (
          activeChannel.type === 'voice' ? <VoiceChannel channel={activeChannel} /> : <Chat channel={activeChannel} />
        ) : activeServer ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, animation: 'fadeIn 0.35s var(--ease-out)' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Welcome to {activeServer.name}</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select a channel to start chatting</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glow on home */}
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.2 }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeInScale 0.5s var(--ease-out)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--accent), #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'var(--text-inverse)', boxShadow: '0 4px 24px rgba(34,211,238,0.3)' }}>K</div>
              <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px' }}>kinetic</h1>
            </div>
            <p style={{ position: 'relative', fontSize: 15, color: 'var(--text-muted)', fontWeight: 400, animation: 'fadeIn 0.5s var(--ease-out) 0.15s both' }}>Select or create a server to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

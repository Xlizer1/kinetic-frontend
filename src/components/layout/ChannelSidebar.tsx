import React, { useState } from 'react';
import { Server } from '../../types/server';
import { Channel } from '../../types/channel';
import { ChannelList } from '../channel/ChannelList';
import { UserProfile } from '../user/UserProfile';
import { ServerSettings } from '../server/ServerSettings';
import { UserSettings } from '../user/UserSettings';

interface ChannelSidebarProps {
  server: Server;
  activeChannelId: number | null;
  onSelectChannel: (channel: Channel) => void;
  onServerUpdated: (server: Server) => void;
  onServerDeleted: (serverId: number) => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({ server, activeChannelId, onSelectChannel, onServerUpdated, onServerDeleted }) => {
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [headerHover, setHeaderHover] = useState(false);

  return (
    <div style={{ width: 240, height: '100%', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid var(--border)' }}>
      {/* Server header */}
      <div
        onClick={() => setShowServerSettings(true)}
        onMouseEnter={() => setHeaderHover(true)}
        onMouseLeave={() => setHeaderHover(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', cursor: 'pointer',
          borderBottom: '1px solid var(--border)',
          background: headerHover ? 'var(--bg-hover)' : 'transparent',
          transition: 'background var(--duration-fast) var(--ease-out)',
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, letterSpacing: '-0.2px' }}>{server.name}</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: 13, opacity: headerHover ? 1 : 0.5, transition: 'opacity var(--duration-fast)' }}>⚙</span>
      </div>

      {/* Channel list */}
      <ChannelList server={server} activeChannelId={activeChannelId} onSelectChannel={onSelectChannel} />

      {/* User settings */}
      <div style={{ padding: '4px 10px' }}>
        <button onClick={() => setShowUserSettings(true)} style={{ width: '100%', padding: '6px 10px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)', transition: 'color var(--duration-fast)', letterSpacing: '0.3px' }}>⚙ Settings</button>
      </div>

      {/* User profile */}
      <UserProfile />

      <ServerSettings open={showServerSettings} onClose={() => setShowServerSettings(false)} server={server} onUpdated={onServerUpdated} onDeleted={onServerDeleted} />
      <UserSettings open={showUserSettings} onClose={() => setShowUserSettings(false)} />
    </div>
  );
};

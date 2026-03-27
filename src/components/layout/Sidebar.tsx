import React from 'react';
import { Server } from '../../types/server';
import { ServerList } from '../server/ServerList';

interface SidebarProps { activeServerId: number | null; onSelectServer: (server: Server) => void; }

export const Sidebar: React.FC<SidebarProps> = ({ activeServerId, onSelectServer }) => {
  return <ServerList activeServerId={activeServerId} onSelectServer={onSelectServer} />;
};

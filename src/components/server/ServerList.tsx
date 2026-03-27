import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { Server } from '../../types/server';
import { ServerIcon } from './ServerIcon';
import { CreateServerModal } from './CreateServerModal';
import { JoinServerModal } from './JoinServerModal';

interface ServerListProps { activeServerId: number | null; onSelectServer: (server: Server) => void; }

export const ServerList: React.FC<ServerListProps> = ({ activeServerId, onSelectServer }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [homeHover, setHomeHover] = useState(false);

  useEffect(() => { api.getServers().then(setServers).catch(console.error); }, []);
  const handleCreated = useCallback((s: Server) => { setServers((p) => [...p, s]); onSelectServer(s); }, [onSelectServer]);
  const handleJoined = useCallback((s: Server) => { setServers((p) => p.find((x) => x.id === s.id) ? p : [...p, s]); onSelectServer(s); }, [onSelectServer]);

  const isHome = activeServerId === null;

  return (
    <>
      <div style={{ width: 72, height: '100%', background: 'var(--bg-deepest)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0', overflowY: 'auto', flexShrink: 0, borderRight: '1px solid var(--border)' }}>
        {/* Home */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', left: -4, width: 4, height: isHome ? 36 : homeHover ? 20 : 0, background: 'var(--accent)', borderRadius: '0 4px 4px 0', transition: 'height 0.25s var(--ease-spring)' }} />
          <button
            onClick={() => onSelectServer(null as unknown as Server)}
            onMouseEnter={() => setHomeHover(true)}
            onMouseLeave={() => setHomeHover(false)}
            title="Home"
            style={{
              width: 48, height: 48,
              borderRadius: isHome || homeHover ? '14px' : '50%',
              border: 'none', cursor: 'pointer',
              background: isHome ? 'linear-gradient(135deg, var(--accent), #0891b2)' : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800,
              color: isHome ? 'var(--text-inverse)' : 'var(--accent)',
              transition: 'border-radius 0.3s var(--ease-spring), background 0.25s var(--ease-out)',
              boxShadow: isHome ? 'var(--shadow-glow)' : 'none',
            }}
          >K</button>
        </div>

        <div style={{ width: 32, height: 2, background: 'var(--border-strong)', borderRadius: 1 }} />

        {servers.map((s) => <ServerIcon key={s.id} server={s} active={s.id === activeServerId} onClick={() => onSelectServer(s)} />)}

        <div style={{ width: 32, height: 2, background: 'var(--border-strong)', borderRadius: 1 }} />

        {/* Add / Join */}
        {[{ label: '+', title: 'Create Server', fn: () => setShowCreate(true) }, { label: '→', title: 'Join Server', fn: () => setShowJoin(true) }].map((btn) => (
          <button key={btn.label} onClick={btn.fn} title={btn.title} style={{ width: 48, height: 48, borderRadius: '50%', border: '1px dashed var(--border-strong)', background: 'transparent', color: 'var(--success)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--duration-normal) var(--ease-out)' }}>
            {btn.label}
          </button>
        ))}
      </div>
      <CreateServerModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      <JoinServerModal open={showJoin} onClose={() => setShowJoin(false)} onJoined={handleJoined} />
    </>
  );
};

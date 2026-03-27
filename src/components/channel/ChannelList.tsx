import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { Channel } from '../../types/channel';
import { Server } from '../../types/server';
import { ChannelItem } from './ChannelItem';
import { CreateChannelModal } from './CreateChannelModal';

interface ChannelListProps { server: Server; activeChannelId: number | null; onSelectChannel: (channel: Channel) => void; }

export const ChannelList: React.FC<ChannelListProps> = ({ server, activeChannelId, onSelectChannel }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { api.getChannels(server.id).then(setChannels).catch(console.error); }, [server.id]);
  const handleCreated = useCallback((ch: Channel) => { setChannels((p) => [...p, ch]); onSelectChannel(ch); }, [onSelectChannel]);

  const text = channels.filter((c) => c.type === 'text');
  const voice = channels.filter((c) => c.type === 'voice');

  const Section: React.FC<{ title: string; items: Channel[] }> = ({ title, items }) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>{title}</span>
          <button onClick={() => setShowCreate(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 15, cursor: 'pointer', padding: '0 4px', lineHeight: 1, opacity: 0.6 }}>+</button>
        </div>
        {items.map((ch) => <ChannelItem key={ch.id} channel={ch} active={ch.id === activeChannelId} onClick={() => onSelectChannel(ch)} />)}
      </div>
    );
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        <Section title="Text Channels" items={text} />
        <Section title="Voice Channels" items={voice} />
        {!channels.length && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', gap: 10 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No channels yet</p>
            <button onClick={() => setShowCreate(true)} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(34,211,238,0.2)' }}>Create Channel</button>
          </div>
        )}
      </div>
      <CreateChannelModal open={showCreate} onClose={() => setShowCreate(false)} serverId={server.id} onCreated={handleCreated} />
    </>
  );
};

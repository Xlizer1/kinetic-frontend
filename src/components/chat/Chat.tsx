import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWS } from '../../context/WebSocketContext';
import { WSServerEvent } from '../../types/websocket';
import { Message } from '../../types/message';
import { Channel } from '../../types/channel';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TYPING_TIMEOUT_MS } from '../../utils/constants';

interface ChatProps { channel: Channel; }

export const Chat: React.FC<ChatProps> = ({ channel }) => {
  const { user } = useAuth();
  const { sendEvent, subscribe } = useWS();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => { setLoading(true); setMessages([]); api.getMessages(channel.id).then((msgs) => setMessages(msgs.reverse())).catch(console.error).finally(() => setLoading(false)); }, [channel.id]);
  useEffect(() => { 
    console.log('[Chat] Joining room:', channel.id);
    sendEvent({ type: 'JOIN_ROOM', payload: { channel_id: channel.id } }); 
    return () => { 
      console.log('[Chat] Leaving room:', channel.id);
      sendEvent({ type: 'LEAVE_ROOM', payload: { channel_id: channel.id } }); 
    }; 
  }, [channel.id, sendEvent]);

  useEffect(() => {
    const unsub = subscribe((ev: WSServerEvent) => {
      if (ev.type === 'NEW_MESSAGE' && ev.payload.channel_id === channel.id) {
        setMessages((p) => [...p, { id: ev.payload.id, channel_id: ev.payload.channel_id, author_id: ev.payload.author_id, content: ev.payload.content, created_at: ev.payload.created_at, updated_at: ev.payload.created_at, author: { id: ev.payload.author_id, username: ev.payload.username, avatar_url: '' } }]);
        setTypingUsers((p) => { const n = new Map(p); n.delete(ev.payload.author_id); return n; });
      }
      if (ev.type === 'TYPING' && ev.payload.channel_id === channel.id && ev.payload.user_id !== user?.id) {
        setTypingUsers((p) => { const n = new Map(p); n.set(ev.payload.user_id, ev.payload.username); return n; });
        const old = timersRef.current.get(ev.payload.user_id); if (old) clearTimeout(old);
        const t = setTimeout(() => { setTypingUsers((p) => { const n = new Map(p); n.delete(ev.payload.user_id); return n; }); timersRef.current.delete(ev.payload.user_id); }, TYPING_TIMEOUT_MS);
        timersRef.current.set(ev.payload.user_id, t);
      }
    });
    return () => { unsub(); timersRef.current.forEach((t) => clearTimeout(t)); timersRef.current.clear(); setTypingUsers(new Map()); };
  }, [channel.id, subscribe, user?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = useCallback(async (content: string) => {
    console.log('[Chat] handleSend called with:', content);
    try {
      const msg = await api.sendMessage(channel.id, content);
      console.log('[Chat] Message sent via HTTP:', msg);
      setMessages(prev => [...prev, msg]);
    } catch (e) {
      console.error('[Chat] Failed to send message:', e);
    }
  }, [channel.id]);
  const handleDelete = useCallback(async (id: number) => { try { await api.deleteMessage(channel.id, id); setMessages((p) => p.filter((m) => m.id !== id)); } catch (e) { console.error(e); } }, [channel.id]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <span style={{ fontSize: 20, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>#</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{channel.name}</span>
        {channel.topic && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border-strong)', margin: '0 4px' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }}>{channel.topic}</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}><LoadingSpinner size={28} /></div>
        ) : !messages.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 8, animation: 'fadeIn 0.4s var(--ease-out)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--accent-dim), rgba(8,145,178,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 4 }}>#</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Welcome to #{channel.name}</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>This is the beginning of the channel.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id} style={{ animation: `fadeIn 0.2s var(--ease-out) ${Math.min(i * 0.02, 0.3)}s both` }}>
              <MessageItem message={msg} isOwn={msg.author_id === user?.id} onDelete={msg.author_id === user?.id ? handleDelete : undefined} />
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <TypingIndicator usernames={Array.from(typingUsers.values())} />
      <MessageInput channelId={channel.id} onSend={handleSend} channelName={channel.name} />
    </div>
  );
};

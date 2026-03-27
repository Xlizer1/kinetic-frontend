import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { Channel } from '../../types/channel';

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  serverId: number;
  onCreated: (channel: Channel) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  open, onClose, serverId, onCreated,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setLoading(true);

    try {
      const channel = await api.createChannel({
        server_id: serverId,
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        type,
      });
      onCreated(channel);
      setName('');
      setType('text');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '8px 12px', background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Channel type selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['text', 'voice'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                flex: 1,
                padding: '10px',
                background: type === t ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: type === t ? '#fff' : 'var(--text-secondary)',
                border: type === t ? 'none' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t === 'text' ? '# Text' : '🔊 Voice'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Channel Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'text' ? 'general-chat' : 'voice-lounge'}
            required
            style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{ padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Creating...' : 'Create Channel'}
        </button>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { Channel } from '../../types/channel';

interface ChannelSettingsProps {
  open: boolean;
  onClose: () => void;
  channel: Channel;
  onUpdated: (channel: Channel) => void;
  onDeleted: (channelId: number) => void;
}

export const ChannelSettings: React.FC<ChannelSettingsProps> = ({
  open, onClose, channel, onUpdated, onDeleted,
}) => {
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updated = await api.updateChannel(channel.id, {
        name: name.trim() || undefined,
        topic: topic.trim(),
      });
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update channel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteChannel(channel.id);
      onDeleted(channel.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete channel');
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Channel Settings">
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '8px 12px', background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Channel Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Topic</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What's this channel about?" style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} style={{ padding: '10px', width: '100%', background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Delete Channel
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Confirm
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px' };

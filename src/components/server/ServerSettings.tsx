import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { Server } from '../../types/server';

interface ServerSettingsProps {
  open: boolean;
  onClose: () => void;
  server: Server;
  onUpdated: (server: Server) => void;
  onDeleted: (serverId: number) => void;
}

export const ServerSettings: React.FC<ServerSettingsProps> = ({
  open, onClose, server, onUpdated, onDeleted,
}) => {
  const [name, setName] = useState(server.name);
  const [iconUrl, setIconUrl] = useState(server.icon_url);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updated = await api.updateServer(server.id, {
        name: name.trim() || undefined,
        icon_url: iconUrl.trim() || undefined,
      });
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      await api.deleteServer(server.id);
      onDeleted(server.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete server');
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Server Settings">
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '8px 12px', background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Server Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Icon URL</label>
          <input type="text" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Invite Code</label>
          <div style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {server.invite_code}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} style={{ padding: '10px', width: '100%', background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Delete Server
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Confirm Delete
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

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px',
};

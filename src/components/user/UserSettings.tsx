import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';

interface UserSettingsProps { open: boolean; onClose: () => void; }

export const UserSettings: React.FC<UserSettingsProps> = ({ open, onClose }) => {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(''); setLoading(true);
    try {
      await api.updateSettings({ theme, language });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div style={{ padding: '8px 12px', background: 'var(--danger-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

        {/* Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Theme</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['light', 'dark'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)} style={{
                flex: 1, padding: 8, borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' as const,
                background: theme === t ? 'linear-gradient(135deg, var(--accent), #0891b2)' : 'var(--bg-tertiary)',
                color: theme === t ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: theme === t ? 'none' : '1px solid var(--border)',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={loading} style={{ padding: 10, background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(34,211,238,0.25)' }}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </Modal>
  );
};

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14 };

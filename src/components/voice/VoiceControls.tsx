import React, { useState } from 'react';
import { useVoice } from '../../context/VoiceContext';

const Btn: React.FC<{ icon: string; label: string; danger?: boolean; active?: boolean; onClick: () => void }> = ({ icon, label, danger, active, onClick }) => {
  const [hover, setHover] = useState(false);
  const bg = danger ? 'var(--danger)' : active ? 'var(--danger)' : hover ? 'var(--bg-elevated)' : 'var(--bg-tertiary)';
  const glow = danger || active ? '0 0 16px rgba(244,63,94,0.3)' : hover ? '0 0 12px rgba(255,255,255,0.05)' : 'none';

  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} title={label}
      style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid var(--border-strong)', background: bg, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glow, transition: 'all var(--duration-normal) var(--ease-out)' }}>
      {icon}
    </button>
  );
};

export const VoiceControls: React.FC = () => {
  const { isMuted, toggleMute, leaveVoice } = useVoice();
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '16px 0' }}>
      <Btn icon={isMuted ? '🔇' : '🎙'} label={isMuted ? 'Unmute' : 'Mute'} active={isMuted} onClick={toggleMute} />
      <Btn icon="📞" label="Disconnect" danger onClick={leaveVoice} />
    </div>
  );
};

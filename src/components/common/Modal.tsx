import React, { useEffect } from 'react';

interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.title}>{title}</h2>
          <button onClick={onClose} style={s.close}>✕</button>
        </div>
        <div style={s.body}>{children}</div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s var(--ease-out)' },
  modal: { width: '100%', maxWidth: 440, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-strong)', overflow: 'hidden', animation: 'fadeInScale 0.3s var(--ease-spring)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px 0' },
  title: { fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' },
  close: { background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: 13, padding: '5px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' },
  body: { padding: '20px 26px 26px' },
};

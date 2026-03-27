import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Invalid or missing reset token'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess('Password reset successful. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={s.logoRow}><div style={s.logoMark}>K</div><h1 style={s.logoText}>kinetic</h1></div>
        <p style={s.subtitle}>Choose a new password</p>
        <form onSubmit={handleSubmit} style={s.form}>
          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.success}>{success}</div>}
          <div style={s.field}><label style={s.label}>New Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={s.input} /></div>
          <button type="submit" disabled={loading || !!success} style={{ ...s.button, opacity: loading ? 0.7 : 1 }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
        <p style={s.footer}><Link to="/login" style={s.link}>Back to sign in</Link></p>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deepest)', padding: 20, position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', top: '10%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(80px)', pointerEvents: 'none', opacity: 0.35 },
  card: { width: '100%', maxWidth: 400, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '44px 36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', animation: 'fadeInScale 0.5s var(--ease-out)' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 },
  logoMark: { width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent), #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--text-inverse)', boxShadow: 'var(--shadow-glow)' },
  logoText: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px' },
  input: { padding: '11px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14 },
  link: { fontSize: 13, color: 'var(--accent)', fontWeight: 500 },
  button: { padding: 12, background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(34,211,238,0.25)' },
  error: { padding: '10px 14px', background: 'var(--danger-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13 },
  success: { padding: '10px 14px', background: 'var(--success-dim)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 13 },
  footer: { marginTop: 28, textAlign: 'center' as const, fontSize: 13, color: 'var(--text-muted)' },
};

export default ResetPassword;

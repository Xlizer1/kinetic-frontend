import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(email, username, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoMark}>K</div>
          <h1 style={s.logoText}>kinetic</h1>
        </div>
        <p style={s.subtitle}>Create your account</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {error && <div style={s.error}>{error}</div>}
          <div style={s.field}><label style={s.label}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={s.input} /></div>
          <button type="submit" disabled={loading} style={{ ...s.button, opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p style={s.footer}>Already have an account?{' '}<Link to="/login" style={s.link}>Sign in</Link></p>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deepest)', padding: 20, position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', top: '8%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(80px)', pointerEvents: 'none', opacity: 0.35 },
  card: { width: '100%', maxWidth: 400, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '40px 36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', position: 'relative', animation: 'fadeInScale 0.5s var(--ease-out)' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 },
  logoMark: { width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent), #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--text-inverse)', boxShadow: 'var(--shadow-glow)' },
  logoText: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px' },
  input: { padding: '11px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14 },
  link: { fontSize: 13, color: 'var(--accent)', fontWeight: 500 },
  button: { padding: 12, background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4, boxShadow: '0 2px 12px rgba(34,211,238,0.25)' },
  error: { padding: '10px 14px', background: 'var(--danger-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13, fontWeight: 500 },
  footer: { marginTop: 24, textAlign: 'center' as const, fontSize: 13, color: 'var(--text-muted)' },
};

export default Register;

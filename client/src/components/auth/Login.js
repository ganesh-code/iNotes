import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 5) e.password = 'Password too short';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">i</div>
            <span className="auth-logo-name">iNotes</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to your workspace</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="animate-spin">⟳</span> Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-link">
            Don't have an account? <Link to="/signup">Create one for free →</Link>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center', padding: '0 20px' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>✨</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.2 }}>
            Your second brain,<br />beautifully organized
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6 }}>
            Write, plan, and organize everything in one place — just like Notion, but yours.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px', textAlign: 'left' }}>
            {['📝 Rich block editor with slash commands', '🗂 Nested pages & workspaces', '⭐ Favorites & smart search', '🌗 Beautiful dark & light mode'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', opacity: 0.9, background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '8px' }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

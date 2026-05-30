import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../index.css';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', cPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.cPassword !== form.password) e.cPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.cPassword);
      toast.success('Account created! Welcome to iNotes 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = () => {
    const p = form.password;
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = strengthLevel();
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">i</div>
            <span className="auth-logo-name">iNotes</span>
          </div>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start organizing your thoughts for free</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} autoComplete="name" />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Password
                {form.password && (
                  <span style={{ color: strengthColors[strength], fontWeight: 500 }}>
                    {strengthLabels[strength]}
                  </span>
                )}
              </label>
              <input type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
              {form.password && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', background: i <= strength ? strengthColors[strength] : 'var(--border-medium)', transition: 'background 0.2s' }} />
                  ))}
                </div>
              )}
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={form.cPassword} onChange={set('cPassword')} autoComplete="new-password" />
              {errors.cPassword && <div className="form-error">{errors.cPassword}</div>}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="animate-spin">⟳</span> Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center', padding: '0 20px' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>🚀</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.2 }}>
            Everything you need<br />to stay organized
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6 }}>
            Join thousands of people who use iNotes as their second brain.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px', textAlign: 'left' }}>
            {['🆓 Free to use, always', '🔐 Your data, secured with JWT', '⚡ Lightning fast, cloud-synced', '📱 Works on any device'].map(f => (
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

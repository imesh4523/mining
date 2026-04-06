import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('crystal_device_id', data.deviceId);
        window.location.href = '/profile';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Server connection failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '40px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', color: '#ffd60a', marginBottom: '10px' }}>Create Account</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '30px' }}>Start your cloud mining journey today</p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email Address"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
          />

          {error && <div style={{ color: '#ff3366', fontSize: '13px', background: 'rgba(255,51,102,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,51,102,0.3)' }}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', fontSize: '15px', padding: '14px' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '13px', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#ffd60a', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

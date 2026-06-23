import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('admin@platform.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Login gagal! Periksa email dan password.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin LMS</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
          <button
            type="submit"
            style={{ width: '100%', padding: '10px', background: '#4a6cf7', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#888' }}>Default: admin@platform.com / password123</p>
      </div>
    </div>
  );
};

export default Login;
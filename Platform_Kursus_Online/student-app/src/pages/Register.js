import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/register', { name, email, password, role: 'student' });
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar isLoggedIn={false} />
      {/* Hero Section dengan Background Gambar */}
      <div
        className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-4"
        style={{
          backgroundImage: `url('https://png.pngtree.com/thumb_back/fh260/background/20240914/pngtree-diverse-group-of-students-studying-in-a-library-with-open-books-image_16203293.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay Gelap agar form terbaca */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Form Registrasi */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Daftar Siswa</h2>
          <p className="text-center text-gray-500 mb-6">Buat akun baru</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="masukkan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
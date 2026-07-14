import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, user, onLogout, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    navigate('/');
  };

  // Fungsi untuk navigasi internal (smooth scroll)
  const handleNavClick = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      // fallback jika onNavigate tidak diberikan
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <span className="text-3xl">📚</span> Defalima Course
        </Link>
        <div className="hidden md:flex items-center gap-6 text-gray-600">
          <button onClick={() => handleNavClick('beranda')} className="hover:text-blue-600 transition">Beranda</button>
          <button onClick={() => handleNavClick('kursus')} className="hover:text-blue-600 transition">Kursus</button>
          <button onClick={() => handleNavClick('fitur')} className="hover:text-blue-600 transition">Fitur</button>
          <button onClick={() => handleNavClick('testimoni')} className="hover:text-blue-600 transition">Testimoni</button>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline">Halo, {user?.name || 'User'}</span>
              <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">Dashboard</Link>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
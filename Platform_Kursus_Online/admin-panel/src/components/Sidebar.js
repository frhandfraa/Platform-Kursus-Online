import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  const menu = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/courses', icon: '📚', label: 'Kursus' },
    { path: '/users', icon: '👥', label: 'Pengguna' },
    { path: '/categories', icon: '🏷️', label: 'Kategori' },
    { path: '/certificates', icon: '🎓', label: 'Sertifikat' }, // <-- tambahkan ini
    { path: '/settings', icon: '⚙️', label: 'Pengaturan' },
  ];

  return (
    <aside className="w-64 bg-indigo-800 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-indigo-700">
        <h1 className="text-2xl font-bold">Defalima Course Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded transition ${
                isActive ? 'bg-indigo-700' : 'hover:bg-indigo-600'
              }`
            }
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded bg-red-500 hover:bg-red-600 transition text-white"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
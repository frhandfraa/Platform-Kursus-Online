import React from 'react';

const Header = ({ user }) => {
  return (
    <header className="bg-white shadow-sm p-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">
          Selamat datang kembali, <span className="font-semibold">{user?.name || 'User'}</span>!
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </header>
  );
};

export default Header;
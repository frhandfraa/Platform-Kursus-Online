import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/api/user');
        setUser(userRes.data);
        const enrollRes = await api.get('/api/enrollments');
        setEnrollments(enrollRes.data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="p-4 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Dashboard Siswa</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Halo, {user?.name}</span>
            <button onClick={handleLogout} className="text-red-500 hover:underline text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Total Kursus</p>
            <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Selesai</p>
            <p className="text-3xl font-bold text-green-600">
              {enrollments.filter(e => e.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Rata-rata Progress</p>
            <p className="text-3xl font-bold text-purple-600">
              {enrollments.length > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + parseFloat(e.progress_percent || 0), 0) / enrollments.length)
                : 0}%
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Kursus yang Diikuti</h2>
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">Belum ada kursus. <Link to="/" className="text-blue-600 hover:underline">Cari kursus</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enroll) => (
              <div key={enroll.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800">{enroll.course?.title}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium text-blue-600">{enroll.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${enroll.progress_percent}%` }}></div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${enroll.status === 'completed' ? 'bg-green-100 text-green-700' : enroll.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {enroll.status}
                    </span>
                    <Link to={`/learn/${enroll.id}`} className="text-blue-600 hover:underline text-sm font-medium">Lanjut Belajar →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
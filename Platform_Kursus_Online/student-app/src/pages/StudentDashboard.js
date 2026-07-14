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

  // Download Sertifikat - Final
  const handleDownloadCertificate = async (enrollmentId) => {
    try {
      // 1. Generate
      const genRes = await api.post(`/api/certificates/${enrollmentId}`);
      if (!genRes.data?.id) {
        alert('Gagal generate sertifikat');
        return;
      }
      const certId = genRes.data.id;

      // 2. Download via fetch langsung ke backend (bawa token)
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/certificates/${certId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sertifikat-${certId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Gagal download: ' + err.message);
    }
  };

  // Statistik
  const totalCourses = enrollments.length;
  const completed = enrollments.filter(e => e.status === 'completed').length;
  const active = enrollments.filter(e => e.status === 'active').length;
  const avgProgress = totalCourses > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + parseFloat(e.progress_percent || 0), 0) / totalCourses)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="relative container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span>👋</span> Selamat Datang, {user?.name || 'Student'}!
              </h1>
              <p className="text-blue-100 mt-1">Teruslah belajar dan raih impianmu!</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm">
                📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Kursus</p>
                <p className="text-3xl font-bold text-gray-800">{totalCourses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Selesai</p>
                <p className="text-3xl font-bold text-gray-800">{completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sedang Berjalan</p>
                <p className="text-3xl font-bold text-gray-800">{active}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Rata-rata Progress</p>
                <p className="text-3xl font-bold text-gray-800">{avgProgress}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">🚀 Semangat Belajar!</h3>
              <p className="text-blue-100">Jangan pernah berhenti belajar. Raih prestasi terbaikmu!</p>
            </div>
            <div className="mt-3 md:mt-0">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                {totalCourses} kursus diikuti
              </span>
            </div>
          </div>
        </div>

        {/* Daftar Kursus */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>📖</span> Kursus Aktif
            </h2>
            <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">Lihat Semua →</Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">Belum ada kursus yang diikuti.</p>
              <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Cari Kursus
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enroll) => {
                const isCompleted = enroll.status === 'completed' && enroll.progress_percent >= 100;
                return (
                  <div key={enroll.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300">
                    {/* Thumbnail */}
                    {enroll.course?.thumbnail ? (
                      <img
                        src={`http://localhost:8000/storage/${enroll.course.thumbnail}`}
                        alt={enroll.course.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white text-4xl">
                        📚
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-800 truncate">{enroll.course?.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{enroll.course?.category || 'Tanpa Kategori'}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span className="font-medium">{enroll.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ${enroll.progress_percent >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${enroll.progress_percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`text-xs px-3 py-1 rounded-full ${enroll.status === 'completed' ? 'bg-green-100 text-green-700' :
                            enroll.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {enroll.status === 'completed' ? '✅ Selesai' :
                            enroll.status === 'active' ? '⚡ Aktif' : '⏸️ Ditunda'}
                        </span>
                        {isCompleted ? (
                          <button
                            onClick={() => handleDownloadCertificate(enroll.id)}
                            className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition"
                          >
                            🎓 Download Sertifikat
                          </button>
                        ) : (
                          <Link
                            to={`/learn/${enroll.id}`}
                            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
                          >
                            Lanjut Belajar →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
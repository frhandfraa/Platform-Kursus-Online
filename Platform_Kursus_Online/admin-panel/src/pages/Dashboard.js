import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Ambil user yang login
      const userRes = await api.get('/api/user');
      setUser(userRes.data);

      // Ambil semua kursus
      const coursesRes = await api.get('/api/courses');
      const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      
      // Ambil semua pengguna (hanya admin yang bisa)
      let users = [];
      try {
        const usersRes = await api.get('/api/users');
        users = Array.isArray(usersRes.data) ? usersRes.data : [];
      } catch (err) {
        console.warn('Gagal ambil users, mungkin bukan admin:', err);
        // Jika gagal, set users = [user yang login]
        users = [userRes.data];
      }

      // Ambil semua enrollment (hanya admin yang bisa)
      let enrollments = [];
      try {
        const enrollRes = await api.get('/api/enrollments');
        enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      } catch (err) {
        console.warn('Gagal ambil enrollments:', err);
        enrollments = [];
      }

      // Hitung statistik
      const totalCourses = courses.length;
      const totalUsers = users.length;
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalInstructors = users.filter(u => u.role === 'instructor' || u.role === 'admin').length;
      const totalEnrollments = enrollments.length;
      
      // Total pendapatan: sum harga kursus (atau dari enrollment jika ada payment)
      const totalRevenue = courses.reduce((sum, c) => sum + parseFloat(c.price || 0), 0);

      // Kursus terbaru (5 kursus terakhir, diurutkan berdasarkan created_at)
      const sortedCourses = [...courses].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      const recentCourses = sortedCourses.slice(0, 5);

      // Pengguna terbaru (5 user terakhir)
      const sortedUsers = [...users].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      const recentUsers = sortedUsers.slice(0, 5);

      setStats({
        totalCourses,
        totalStudents,
        totalInstructors,
        totalUsers,
        totalEnrollments,
        totalRevenue,
      });
      setRecentCourses(recentCourses);
      setRecentUsers(recentUsers);
    } catch (err) {
      console.error('Error fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />

        {/* Statistik Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Kursus</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
              </div>
              <div className="text-3xl text-blue-500">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Siswa</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <div className="text-3xl text-green-500">👨‍🎓</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Instruktur</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalInstructors}</p>
              </div>
              <div className="text-3xl text-purple-500">🧑‍🏫</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendapatan</p>
                <p className="text-2xl font-bold text-gray-800">{formatRupiah(stats.totalRevenue)}</p>
              </div>
              <div className="text-3xl text-yellow-500">💰</div>
            </div>
          </div>
        </section>

        {/* Baris kedua: Enrollments & Users */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Enrollment</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalEnrollments}</p>
              </div>
              <div className="text-3xl text-indigo-500">📋</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pengguna</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="text-3xl text-red-500">👥</div>
            </div>
          </div>
        </section>

        {/* Kursus Terbaru */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">📖 Kursus Terbaru</h3>
            </div>
            {recentCourses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Belum ada kursus</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                    <tr>
                      <th className="py-3 px-4">Judul</th>
                      <th className="py-3 px-4">Instruktur</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{course.title}</td>
                        <td className="py-3 px-4">{course.instructor?.name || '-'}</td>
                        <td className="py-3 px-4">{course.level}</td>
                        <td className="py-3 px-4">{formatRupiah(course.price)}</td>
                        <td className="py-3 px-4">{formatDate(course.created_at)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {course.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Pengguna Terbaru */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">👥 Pengguna Terbaru</h3>
            </div>
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Belum ada pengguna</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                    <tr>
                      <th className="py-3 px-4">Nama</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{u.name}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                            u.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
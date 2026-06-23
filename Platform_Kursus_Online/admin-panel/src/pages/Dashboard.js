import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalInstructors: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/api/user');
        setUser(userRes.data);

        const coursesRes = await api.get('/api/courses');
        setCourses(coursesRes.data);
        
        // Nanti kita ganti dengan API real
        setStats({
          totalCourses: coursesRes.data.length,
          totalStudents: 25,
          totalRevenue: 12500000,
          totalInstructors: 3,
        });
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <StatCard title="Total Kursus" value={stats.totalCourses} icon="📚" color="blue" />
          <StatCard title="Total Siswa" value={stats.totalStudents} icon="👨‍🎓" color="green" />
          <StatCard title="Pendapatan" value={formatRupiah(stats.totalRevenue)} icon="💰" color="yellow" />
          <StatCard title="Instruktur" value={stats.totalInstructors} icon="🧑‍🏫" color="purple" />
        </section>
        <section className="p-6 pt-0">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kursus Terbaru</h3>
              <button className="text-sm text-blue-600 hover:underline">Lihat Semua</button>
            </div>
            {courses.length === 0 ? (
              <p className="text-gray-500">Belum ada kursus.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                    <tr>
                      <th className="py-3 px-4">Judul</th>
                      <th className="py-3 px-4">Instruktur</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 5).map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{course.title}</td>
                        <td className="py-3 px-4">{course.instructor?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.level === 'Pemula' ? 'bg-green-100 text-green-700' :
                            course.level === 'Menengah' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{course.level}</span>
                        </td>
                        <td className="py-3 px-4">{formatRupiah(course.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.is_published ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>{course.is_published ? 'Published' : 'Draft'}</span>
                        </td>
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
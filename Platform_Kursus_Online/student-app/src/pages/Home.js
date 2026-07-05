import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      // res.data sekarang array, karena response JSON
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Gagal fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) { }
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[600px] flex items-center" style={{ backgroundImage: `url('https://plus.unsplash.com/premium_photo-1661931625203-86d57a9d8470?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Belajar Kapan Saja, Di Mana Saja</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90 drop-shadow">Platform kursus online dengan materi berkualitas dari para ahli di bidangnya.</p>
          <Link to={isLoggedIn ? '/dashboard' : '/register'} className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-xl transition hover:scale-105">
            {isLoggedIn ? 'Lanjut Belajar' : 'Mulai Sekarang Gratis'}
          </Link>
        </div>
      </section>

      {/* Fitur */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">Video Pembelajaran</h3>
              <p className="text-gray-600">Akses video berkualitas tinggi yang bisa diputar kapan saja.</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Kuis Interaktif</h3>
              <p className="text-gray-600">Uji pemahaman dengan kuis dan dapatkan nilai instan.</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-2">Sertifikat</h3>
              <p className="text-gray-600">Dapatkan sertifikat setelah menyelesaikan kursus dengan baik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Kursus */}
      <section id="courses" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Kursus Unggulan</h2>
          {loading ? (
            <div className="text-center text-gray-500">Memuat kursus...</div>
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada kursus yang tersedia.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                  {course.thumbnail && (
                    <img src={`http://localhost:8000/storage/${course.thumbnail}`} alt={course.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{course.category || 'Tanpa Kategori'}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{course.level}</span>
                      <span className="font-bold text-blue-600">Rp {course.price?.toLocaleString() || 0}</span>
                    </div>
                    <Link to={`/course/${course.id}`} className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Lihat Detail</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimoni */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Apa Kata Mereka?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-600 italic">"Platform ini sangat membantu saya belajar matematika dari nol. Materi mudah dipahami!"</p>
              <p className="font-semibold mt-4">— Andi, Mahasiswa</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-600 italic">"Kuisnya menantang dan membuat saya benar-benar paham. Sertifikatnya juga keren!"</p>
              <p className="font-semibold mt-4">— Rina, Siswa SMA</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-600 italic">"Instrukturnya ramah dan responsif. Sangat direkomendasikan untuk siapa saja."</p>
              <p className="font-semibold mt-4">— Budi, Karyawan</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">© 2026 Defalima Course. Dibuat dengan ❤️ untuk pendidikan.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
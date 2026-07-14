import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
    fetchCourses();

    // Intersection Observer untuk animasi scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Gagal fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  // Fungsi untuk scroll ke section (digunakan oleh Navbar)
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fungsi untuk menambahkan ref ke elemen
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={scrollToSection}  // <-- kirim fungsi ke navbar
      />

      {/* ========== HERO SECTION ========== */}
      <section id="beranda" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background dengan overlay gradien */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url('https://plus.unsplash.com/premium_photo-1661931625203-86d57a9d8470?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-indigo-900/60 to-purple-900/70" />
        
        {/* Dekorasi blur */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float delay-500" />

        {/* Konten Hero */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm md:text-base font-medium text-blue-200 tracking-widest uppercase animate-fade-in">
              🚀 Platform Belajar Online
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mt-4 leading-tight animate-fade-in-up delay-100">
              Belajar Kapan Saja,
              <span className="block text-gradient">Di Mana Saja</span>
            </h1>
            <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto text-blue-100/90 animate-fade-in-up delay-200">
              Platform kursus online dengan materi berkualitas dari para ahli di bidangnya.
              Mulai perjalanan belajarmu sekarang!
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link
                to={isLoggedIn ? '/dashboard' : '/register'}
                className="btn-glow inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30"
              >
                {isLoggedIn ? '🚀 Lanjut Belajar' : '🎯 Mulai Sekarang Gratis'}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={() => scrollToSection('kursus')}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20"
              >
                Lihat Kursus
              </button>
            </div>
            {/* Statistik mini */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto animate-fade-in-up delay-400">
              <div className="text-center">
                <p className="text-2xl font-bold">{courses.length}+</p>
                <p className="text-sm text-blue-200">Kursus</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-blue-200">Siswa</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">10+</p>
                <p className="text-sm text-blue-200">Instruktur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FITUR UNGGULAN ========== */}
      <section id="fitur" ref={addToRefs} className="py-20 bg-white opacity-0">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Fitur Unggulan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              Kenapa Harus <span className="text-gradient">Defalima Course</span>?
            </h2>
            <p className="text-gray-500 mt-3">Nikmati pengalaman belajar yang interaktif dan menyenangkan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎬', title: 'Video Pembelajaran', desc: 'Akses video berkualitas tinggi yang bisa diputar kapan saja, dengan durasi yang fleksibel.' },
              { icon: '📝', title: 'Kuis Interaktif', desc: 'Uji pemahaman dengan kuis menarik dan dapatkan nilai instan beserta pembahasan.' },
              { icon: '🎓', title: 'Sertifikat Resmi', desc: 'Dapatkan sertifikat setelah menyelesaikan kursus dengan baik, untuk menunjang karirmu.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="card-hover bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 hover:border-blue-200"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== KURSUS UNGGULAN ========== */}
      <section id="kursus" ref={addToRefs} className="py-20 bg-gray-50 opacity-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Kursus</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                Kursus <span className="text-gradient">Unggulan</span>
              </h2>
            </div>
            <Link to="/courses" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Memuat kursus...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-500">Belum ada kursus yang tersedia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 6).map((course, idx) => (
                <div
                  key={course.id}
                  className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 group"
                >
                  <div className="relative overflow-hidden h-52">
                    {course.thumbnail ? (
                      <img
                        src={`http://localhost:8000/storage/${course.thumbnail}`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-5xl">
                        📘
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{course.category || 'Tanpa Kategori'}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-blue-600">
                        Rp {course.price?.toLocaleString() || 0}
                      </span>
                      <span className="text-sm text-gray-400">⭐ {course.rating || 4.5}</span>
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="mt-4 w-full block text-center bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-md shadow-blue-600/20 group-hover:shadow-lg"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== TESTIMONI ========== */}
      <section id="testimoni" ref={addToRefs} className="py-20 bg-white opacity-0">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Testimoni</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              Apa Kata <span className="text-gradient">Mereka</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Andi', role: 'Mahasiswa', text: 'Platform ini sangat membantu saya belajar matematika dari nol. Materi mudah dipahami dan kuisnya menantang!' },
              { name: 'Rina', role: 'Siswa SMA', text: 'Kuisnya menantang dan membuat saya benar-benar paham. Sertifikatnya juga keren untuk portofolio.' },
              { name: 'Budi', role: 'Karyawan', text: 'Instrukturnya ramah dan responsif. Sangat direkomendasikan untuk siapa saja yang ingin upgrade skill.' },
            ].map((t, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 card-hover">
                <div className="flex text-yellow-400 mb-3">★★★★★</div>
                <p className="text-gray-600 italic leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Siap Memulai Perjalanan Belajarmu?</h2>
          <p className="text-blue-100 mt-3 max-w-xl mx-auto">Bergabunglah dengan ribuan siswa lainnya dan raih impianmu bersama Defalima Course.</p>
          <Link
            to={isLoggedIn ? '/dashboard' : '/register'}
            className="btn-glow inline-block mt-6 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-50 transition-all duration-300"
          >
            {isLoggedIn ? '🚀 Lanjut Belajar' : '🎯 Daftar Sekarang'}
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">© 2026 Defalima Course. Dibuat dengan ❤️ untuk pendidikan.</p>
          <div className="flex justify-center gap-6 mt-3">
            <button onClick={() => scrollToSection('beranda')} className="text-gray-400 hover:text-white transition">Beranda</button>
            <button onClick={() => scrollToSection('kursus')} className="text-gray-400 hover:text-white transition">Kursus</button>
            <button onClick={() => scrollToSection('fitur')} className="text-gray-400 hover:text-white transition">Fitur</button>
            <button onClick={() => scrollToSection('testimoni')} className="text-gray-400 hover:text-white transition">Testimoni</button>
            <a href="#" className="text-gray-400 hover:text-white transition">Kontak</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
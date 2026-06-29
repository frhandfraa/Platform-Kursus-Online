import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/courses');
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">LMS Siswa</h1>
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📚 Daftar Kursus</h2>
        <p className="text-gray-500 mb-6">Temukan kursus yang sesuai dengan minat Anda</p>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat kursus...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500">Belum ada kursus yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                {course.thumbnail && (
                  <img
                    src={`http://localhost:8000/storage/${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 truncate">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.category || 'Tanpa Kategori'}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{course.level}</span>
                    <span className="font-bold text-blue-600">Rp {course.price?.toLocaleString() || 0}</span>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
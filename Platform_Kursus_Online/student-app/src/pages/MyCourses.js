import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/api/my-courses');
        if (Array.isArray(res.data)) {
          setEnrollments(res.data);
        } else {
          setEnrollments([]);
        }
      } catch (err) {
        setError('Gagal memuat kursus');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) return <div className="text-center py-8">Memuat...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Kursus Saya</h1>
      {enrollments.length === 0 ? (
        <p className="text-gray-500">Anda belum mendaftar kursus apapun.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold">{enrollment.course?.title}</h2>
              <p className="text-gray-600">Progress: {enrollment.progress_percent}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${enrollment.progress_percent}%` }}></div>
              </div>
              <Link to={`/course-learn/${enrollment.course_id}`} className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Lanjut Belajar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
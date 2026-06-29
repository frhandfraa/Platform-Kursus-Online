import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/courses/${id}`);
        setCourse(res.data);
        await checkEnrollment();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const checkEnrollment = async () => {
    try {
      const res = await api.get('/api/enrollments');
      const found = res.data.find(e => e.course_id === parseInt(id));
      if (found) {
        setEnrolled(true);
        setEnrollmentStatus(found.status);
        setEnrollmentId(found.id);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const res = await api.post('/api/enrollments', { course_id: id });
      alert(res.data.message);
      setEnrolled(true);
      setEnrollmentStatus('active');
      setEnrollmentId(res.data.enrollment.id);
      navigate(`/learn/${res.data.enrollment.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mendaftar');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Memuat...</div>;
  if (!course) return <div className="p-4 text-center text-red-500">Kursus tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">LMS Siswa</Link>
          <Link to="/dashboard" className="text-blue-600 hover:underline font-medium">Dashboard</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          {course.thumbnail && (
            <img
              src={`http://localhost:8000/storage/${course.thumbnail}`}
              alt={course.title}
              className="w-full h-72 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-600 mt-2 leading-relaxed">{course.description || 'Tidak ada deskripsi'}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Level: {course.level}</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{course.category || 'Umum'}</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Rp {course.price?.toLocaleString() || 0}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                Durasi: {course.duration_hours || 0} jam
              </span>
            </div>
            <div className="mt-6">
              {enrolled ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-semibold">✅ Anda sudah terdaftar di kursus ini</p>
                  <p className="text-sm text-gray-600">Status: {enrollmentStatus}</p>
                  <button
                    onClick={() => navigate(`/learn/${enrollmentId}`)}
                    className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Lanjut Belajar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {isEnrolling ? 'Memproses...' : '📚 Daftar Sekarang'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
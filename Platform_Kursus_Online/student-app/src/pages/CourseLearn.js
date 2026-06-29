import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CourseLearn = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markComplete = async (lessonId) => {
    try {
      await api.post(`/api/enrollments/${enrollmentId}/complete/${lessonId}`);
      // Refresh data
      const res = await api.get(`/api/enrollments/${enrollmentId}`);
      setEnrollment(res.data);
    } catch (err) {
      alert('Gagal menandai selesai');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/enrollments/${enrollmentId}`);
        setEnrollment(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enrollmentId]);

  if (loading) return <div className="p-4 text-center">Memuat materi...</div>;
  if (error) return (
    <div className="p-4 text-center text-red-600">
      {error}
      <button onClick={() => navigate('/dashboard')} className="block mx-auto mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Kembali</button>
    </div>
  );
  if (!enrollment) return <div className="p-4 text-center">Data tidak ditemukan</div>;

  const { course } = enrollment;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 truncate">{course?.title}</h1>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:underline">Dashboard</button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex justify-between items-center">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="font-bold text-blue-600">{enrollment.progress_percent}%</span>
          <div className="w-48 bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${enrollment.progress_percent}%` }}></div>
          </div>
        </div>

        <div className="space-y-4">
          {course?.modules?.map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-100 px-5 py-3 border-b">
                <h3 className="font-semibold text-gray-800">{module.title}</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {module.lessons?.map((lesson) => (
                  <li key={lesson.id} className="px-5 py-3 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {lesson.content_type === 'video' && '🎬'}
                        {lesson.content_type === 'text' && '📝'}
                        {lesson.content_type === 'file' && '📎'}
                        {lesson.content_type === 'quiz' && '📝'}
                      </span>
                      <span className="text-gray-700">{lesson.title}</span>
                    </div>
                    {lesson.content_type === 'quiz' && (
                      <Link to={`/quiz/${lesson.id}`} className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition">
                        Kerjakan
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseLearn;
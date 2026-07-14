import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CourseLearn = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch data enrollment + completed lessons
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/enrollments/${enrollmentId}`);
        // Response dari backend sudah include completed_lessons
        setEnrollment(res.data);
        setCompletedLessons(res.data.completed_lessons || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enrollmentId]);

  // Hitung progress dari completedLessons
  const calculateProgress = () => {
    if (!enrollment?.course?.modules) return 0;
    const allLessons = enrollment.course.modules.flatMap(m => m.lessons || []);
    if (allLessons.length === 0) return 0;
    const completedCount = allLessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completedCount / allLessons.length) * 100);
  };

  const progress = calculateProgress();

  // Toggle complete via API
  const toggleLessonComplete = async (lessonId) => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await api.post(`/api/lessons/${lessonId}/complete`);
      // Update state berdasarkan response
      if (res.data.completed) {
        setCompletedLessons(prev => [...prev, lessonId]);
      } else {
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
      }
      // Update progress di enrollment
      setEnrollment(prev => ({
        ...prev,
        progress_percent: res.data.progress_percent,
      }));
    } catch (err) {
      alert('Gagal update progress: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  // Buka modal
  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLesson(null);
  };

  // Render konten modal
  const renderLessonContent = () => {
    if (!selectedLesson) return null;
    switch (selectedLesson.content_type) {
      case 'video':
        return (
          <div className="aspect-w-16 aspect-h-9">
            {selectedLesson.video_url ? (
              <iframe
                src={selectedLesson.video_url}
                title={selectedLesson.title}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="bg-gray-200 rounded-lg flex items-center justify-center h-64">
                <p className="text-gray-500">URL video tidak tersedia</p>
              </div>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">{selectedLesson.title}</h3>
            {selectedLesson.file_attachment ? (
              <a
                href={`http://localhost:8000/storage/${selectedLesson.file_attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                📥 Download File
              </a>
            ) : (
              <p className="text-gray-500">File belum diupload</p>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">{selectedLesson.title}</h3>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {selectedLesson.content_text || 'Konten belum tersedia'}
            </div>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat materi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Enrollment tidak valid.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { course } = enrollment;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold truncate">{course?.title || 'Belajar'}</h1>
              <p className="text-blue-100 text-sm">Progress: {progress}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="bg-white/20 px-4 py-1 rounded-full text-sm flex items-center gap-2">
              <span>📊</span>
              <span>{progress}%</span>
            </div>
            <Link to="/dashboard" className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Progress Bar Besar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">Progress Belajar</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                progress >= 100 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
            {progress >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">🎉 Selesai!</span>
              </div>
            )}
          </div>
          {progress >= 100 && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                🏆 Selamat! Anda telah menyelesaikan kursus ini!
              </span>
            </div>
          )}
        </div>

        {/* Modul & Materi */}
        <div className="space-y-4">
          {course?.modules?.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700">Belum Ada Modul</h3>
              <p className="text-gray-500 mt-2">Instruktur belum menambahkan materi untuk kursus ini.</p>
            </div>
          ) : (
            course?.modules?.map((module, index) => {
              const moduleLessons = module.lessons || [];
              const completedCount = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
              const moduleProgress = moduleLessons.length > 0 ? Math.round((completedCount / moduleLessons.length) * 100) : 0;

              return (
                <div key={module.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  {/* Module Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b flex items-center gap-4">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-800 flex-1">{module.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {completedCount}/{moduleLessons.length} materi
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <ul className="divide-y divide-gray-100">
                    {moduleLessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      return (
                        <li
                          key={lesson.id}
                          className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:bg-gray-50/50 ${
                            isCompleted ? 'bg-green-50/30' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleLessonComplete(lesson.id)}
                              disabled={updating}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {isCompleted && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg flex-shrink-0">
                                {lesson.content_type === 'video' && '🎬'}
                                {lesson.content_type === 'text' && '📝'}
                                {lesson.content_type === 'file' && '📎'}
                                {lesson.content_type === 'quiz' && '📝'}
                              </span>
                              <span
                                className={`text-gray-700 font-medium truncate cursor-pointer hover:text-blue-600 transition ${
                                  isCompleted ? 'line-through text-gray-400' : ''
                                }`}
                                onClick={() => openLesson(lesson)}
                              >
                                {lesson.title}
                              </span>
                              {lesson.is_free && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">Gratis</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isCompleted ? (
                              <span className="text-xs text-green-600 font-medium">Selesai ✅</span>
                            ) : (
                              <span className="text-xs text-gray-400">Belum</span>
                            )}
                            {lesson.content_type === 'quiz' ? (
                              <Link
                                to={`/quiz/${lesson.id}`}
                                className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition"
                              >
                                Kerjakan
                              </Link>
                            ) : (
                              <button
                                onClick={() => openLesson(lesson)}
                                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
                              >
                                Buka
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>

        {/* Tombol Kembali */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-6 py-2.5 rounded-xl hover:bg-gray-700 transition shadow-md"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </main>

      {/* Modal / Popup untuk Melihat Materi */}
      {modalOpen && selectedLesson && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>
                  {selectedLesson.content_type === 'video' && '🎬'}
                  {selectedLesson.content_type === 'text' && '📝'}
                  {selectedLesson.content_type === 'file' && '📎'}
                </span>
                {selectedLesson.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl transition"
              >
                ✕
              </button>
            </div>

            {/* Konten Modal */}
            <div className="p-6">
              {renderLessonContent()}
            </div>

            {/* Footer Modal */}
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  toggleLessonComplete(selectedLesson.id);
                  // Tidak langsung close agar user melihat perubahan
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  completedLessons.includes(selectedLesson.id)
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {completedLessons.includes(selectedLesson.id)
                  ? '↩️ Batalkan Selesai'
                  : '✅ Tandai Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLearn;
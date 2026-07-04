import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CourseLearn = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Fungsi untuk membuka modal materi
  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeLesson = () => {
    setModalOpen(false);
    setSelectedLesson(null);
  };

  // Fungsi untuk menandai materi selesai (nanti diimplementasikan)
  const markAsCompleted = async () => {
    // TODO: Update progress
    alert('Fitur mark as completed akan segera hadir!');
    closeLesson();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat materi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😕</div>
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
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📝</div>
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

  // Render konten materi berdasarkan tipe
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold truncate max-w-xs md:max-w-md">
                {course?.title || 'Belajar'}
              </h1>
              <p className="text-blue-100 text-sm">Progress: {enrollment.progress_percent}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <div className="bg-white/20 px-4 py-1 rounded-full text-sm flex items-center gap-2">
              <span>📊</span>
              <span>{enrollment.progress_percent}%</span>
            </div>
            <Link to="/dashboard" className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Progress Bar Besar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress Belajar</span>
            <span className="font-bold text-blue-600">{enrollment.progress_percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                enrollment.progress_percent >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${enrollment.progress_percent}%` }}
            ></div>
          </div>
          {enrollment.progress_percent >= 100 && (
            <div className="mt-3 text-center">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                🎉 Selamat! Anda telah menyelesaikan kursus ini!
              </span>
            </div>
          )}
        </div>

        {/* Modul & Materi */}
        <div className="space-y-4">
          {course?.modules?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700">Belum Ada Modul</h3>
              <p className="text-gray-500 mt-2">Instruktur belum menambahkan materi untuk kursus ini.</p>
            </div>
          ) : (
            course?.modules?.map((module, index) => (
              <div key={module.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b flex items-center gap-3">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-gray-800">{module.title}</h3>
                  <span className="ml-auto text-sm text-gray-400">
                    {module.lessons?.length || 0} materi
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {module.lessons?.map((lesson) => (
                    <li key={lesson.id} className="px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition cursor-pointer">
                      <div 
                        className="flex items-center gap-3 flex-1"
                        onClick={() => openLesson(lesson)}
                      >
                        <span className="text-xl">
                          {lesson.content_type === 'video' && '🎬'}
                          {lesson.content_type === 'text' && '📝'}
                          {lesson.content_type === 'file' && '📎'}
                          {lesson.content_type === 'quiz' && '📝'}
                        </span>
                        <div>
                          <span className="text-gray-700 font-medium hover:text-blue-600 transition">
                            {lesson.title}
                          </span>
                          {lesson.is_free && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Gratis</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-2">
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
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Tombol Kembali */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </main>

      {/* Modal / Popup untuk Melihat Materi */}
      {modalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                onClick={closeLesson}
                className="text-gray-500 hover:text-gray-700 text-2xl"
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
                onClick={closeLesson}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                onClick={markAsCompleted}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                ✅ Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLearn;
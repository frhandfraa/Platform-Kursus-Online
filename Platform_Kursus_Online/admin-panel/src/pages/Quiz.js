import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Quiz = () => {
  const { lessonId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    time_limit: 0,
    passing_score: 70,
    max_attempts: 1,
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!lessonId) {
      navigate('/courses');
      return;
    }
    fetchUser();
    fetchLesson();
    fetchQuiz();
  }, [lessonId]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      setUser(res.data);
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/api/lessons/${lessonId}`);
      setLesson(res.data);
    } catch (err) {
      console.error('Gagal ambil lesson:', err);
    }
  };

  const fetchQuiz = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/lessons/${lessonId}/quiz`);
      // Jika response memiliki data dan id, set quiz
      if (res.data && res.data.id) {
        setQuiz(res.data);
        setFormData({
          title: res.data.title || '',
          time_limit: res.data.time_limit || 0,
          passing_score: res.data.passing_score || 70,
          max_attempts: res.data.max_attempts || 1,
        });
      } else {
        setQuiz(null);
      }
    } catch (err) {
      // Jika 404, berarti belum ada kuis
      if (err.response?.status === 404) {
        setQuiz(null);
      } else {
        console.error('Gagal ambil kuis:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) { }
    localStorage.clear();
    navigate('/login');
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setFormData({
      title: '',
      time_limit: 0,
      passing_score: 70,
      max_attempts: 1,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let response;
      if (quiz && quiz.id) {
        // Update existing quiz
        response = await api.put(`/api/quizzes/${quiz.id}`, formData);
      } else {
        // Create new quiz
        response = await api.post(`/api/lessons/${lessonId}/quiz`, formData);
      }

      // Pastikan response memiliki data
      if (response.data && response.data.id) {
        setQuiz(response.data);
        setFormData({
          title: response.data.title || '',
          time_limit: response.data.time_limit || 0,
          passing_score: response.data.passing_score || 70,
          max_attempts: response.data.max_attempts || 1,
        });
        closeModal();
        // Refresh data setelah menyimpan
        await fetchQuiz();
      } else {
        alert('Gagal menyimpan kuis: data tidak valid');
      }
    } catch (err) {
      alert('Gagal menyimpan kuis: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quiz || !quiz.id) {
      alert('Kuis tidak ditemukan');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus kuis ini?')) return;
    try {
      await api.delete(`/api/quizzes/${quiz.id}`);
      setQuiz(null);
      await fetchQuiz();
    } catch (err) {
      alert('Gagal menghapus');
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Kuis</h2>
              <p className="text-gray-600">Materi: {lesson?.title || 'Loading...'}</p>
            </div>
            <div>
              {!quiz && (
                <button
                  onClick={openModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mr-2"
                >
                  + Buat Kuis
                </button>
              )}
              {quiz && quiz.id && (
                <button
                  onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition mr-2"
                >
                  Soal
                </button>
              )}
              <button
                onClick={openModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mr-2"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Hapus
              </button>              
          </div>
        </div>

        {loading ? (
          <p>Memuat...</p>
        ) : quiz ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Judul Kuis</p>
                <p className="text-lg font-semibold">{quiz.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Batas Waktu</p>
                <p className="text-lg font-semibold">{quiz.time_limit > 0 ? `${quiz.time_limit} menit` : 'Tidak terbatas'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nilai Lulus</p>
                <p className="text-lg font-semibold">{quiz.passing_score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maksimal Percobaan</p>
                <p className="text-lg font-semibold">{quiz.max_attempts} kali</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Jumlah Soal</p>
                <p className="text-lg font-semibold">{quiz.questions?.length || 0} soal</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
            Belum ada kuis untuk materi ini. Klik "Buat Kuis" untuk memulai.
          </div>
        )}
    </div>
      </main >

  <Modal isOpen={modalOpen} onClose={closeModal} title={quiz ? 'Edit Kuis' : 'Buat Kuis'}>
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Judul Kuis*</label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Batas Waktu (menit, 0 = tidak terbatas)</label>
        <input
          type="number"
          name="time_limit"
          value={formData.time_limit}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          min="0"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nilai Lulus (%)</label>
        <input
          type="number"
          name="passing_score"
          value={formData.passing_score}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          min="0"
          max="100"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Maksimal Percobaan</label>
        <input
          type="number"
          name="max_attempts"
          value={formData.max_attempts}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          min="1"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  </Modal>
    </div >
  );
};

export default Quiz;
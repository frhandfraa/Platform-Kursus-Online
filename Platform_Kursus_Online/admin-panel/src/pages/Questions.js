import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Questions = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    type: 'multiple_choice',
    score: 1,
    sort_order: 0,
    options: [{ option_text: '', is_correct: false }],
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Validasi quizId
    if (!quizId || isNaN(quizId)) {
      setError('ID kuis tidak valid');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      await fetchUser();
      await fetchQuiz();
      await fetchQuestions();
    };
    fetchData();
  }, [quizId]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      setUser(res.data);
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchQuiz = async () => {
    if (!quizId) return;
    try {
      const res = await api.get(`/api/quizzes/${quizId}`);
      if (res.data && res.data.id) {
        setQuiz(res.data);
      } else {
        setError('Kuis tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetch quiz:', err);
      if (err.response?.status === 404) {
        setError('Kuis tidak ditemukan');
      } else {
        setError('Gagal mengambil data kuis');
      }
    }
  };

  const fetchQuestions = async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/quizzes/${quizId}/questions`);
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetch questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question_text: question.question_text || '',
        type: question.type || 'multiple_choice',
        score: question.score || 1,
        sort_order: question.sort_order || 0,
        options: question.options?.length ? question.options : [{ option_text: '', is_correct: false }],
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question_text: '',
        type: 'multiple_choice',
        score: 1,
        sort_order: 0,
        options: [{ option_text: '', is_correct: false }],
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingQuestion(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { option_text: '', is_correct: false }],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 1) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.type === 'essay') {
        delete payload.options;
      }
      if (editingQuestion) {
        await api.put(`/api/questions/${editingQuestion.id}`, payload);
      } else {
        await api.post(`/api/quizzes/${quizId}/questions`, payload);
      }
      closeModal();
      fetchQuestions();
    } catch (err) {
      alert('Gagal menyimpan soal');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus soal ini?')) return;
    try {
      await api.delete(`/api/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  // Jika ada error, tampilkan pesan
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <Header user={user} />
          <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => navigate('/courses')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Kembali ke Manajemen Kursus
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Soal</h2>
              <p className="text-gray-600">Kuis: {quiz?.title || 'Loading...'}</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Tambah Soal
            </button>
          </div>
          {loading ? (
            <p>Memuat...</p>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              Belum ada soal. Tambahkan soal pertama!
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Soal</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Skor</th>
                    <th className="py-3 px-4">Opsi</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr key={q.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-medium">{q.question_text}</td>
                      <td className="py-3 px-4">
                        {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
                      </td>
                      <td className="py-3 px-4">{q.score}</td>
                      <td className="py-3 px-4">{q.options?.length || 0}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openModal(q)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingQuestion ? 'Edit Soal' : 'Tambah Soal'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Teks Soal*</label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tipe Soal*</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="multiple_choice">Pilihan Ganda</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          {formData.type === 'multiple_choice' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Opsi Jawaban</label>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={opt.option_text}
                    onChange={(e) => handleOptionChange(idx, 'option_text', e.target.value)}
                    placeholder={`Opsi ${idx + 1}`}
                    className="flex-1 border rounded px-3 py-2"
                    required
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={opt.is_correct}
                      onChange={(e) => handleOptionChange(idx, 'is_correct', e.target.checked)}
                      className="mr-1"
                    />
                    Benar
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Tambah Opsi
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skor</label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urutan</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Questions;
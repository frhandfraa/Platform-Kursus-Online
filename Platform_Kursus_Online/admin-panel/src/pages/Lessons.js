import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Lessons = () => {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [module, setModule] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'text',
    video_url: '',
    content_text: '',
    sort_order: 0,
    is_free: false,
  });
  const [fileAttachment, setFileAttachment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!moduleId) {
      console.error('moduleId tidak ada, redirect ke /courses');
      navigate('/courses');
      return;
    }
    console.log('moduleId:', moduleId);
    fetchUser();
    fetchModule();
    fetchLessons();
  }, [moduleId]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      setUser(res.data);
    } catch (err) {
      console.error('Gagal fetch user:', err);
      navigate('/login');
    }
  };

  const fetchModule = async () => {
    try {
      const res = await api.get(`/api/modules/${moduleId}`);
      setModule(res.data);
    } catch (err) {
      console.error('Gagal ambil modul:', err);
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/modules/${moduleId}/lessons`);
      console.log('Data lessons:', res.data);
      setLessons(res.data);
    } catch (err) {
      console.error('Gagal ambil materi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) { }
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        content_type: lesson.content_type,
        video_url: lesson.video_url || '',
        content_text: lesson.content_text || '',
        sort_order: lesson.sort_order || 0,
        is_free: lesson.is_free || false,
      });
      setFileAttachment(null);
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        content_type: 'text',
        video_url: '',
        content_text: '',
        sort_order: 0,
        is_free: false,
      });
      setFileAttachment(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLesson(null);
    setFileAttachment(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttachment(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'is_free') {
          // Kirim sebagai integer: 1 atau 0
          formDataToSend.append(key, formData[key] ? 1 : 0);
        } else if (key !== 'file_attachment') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (fileAttachment) {
        formDataToSend.append('file_attachment', fileAttachment);
      }

      if (editingLesson) {
        formDataToSend.append('_method', 'PUT');
        await api.post(`/api/lessons/${editingLesson.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/api/modules/${moduleId}/lessons`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      closeModal();
      fetchLessons();
    } catch (err) {
      alert('Gagal menyimpan materi');
      console.error(err);
    }
  };

  async function handleDelete(id) {
    if (!window.confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      await api.delete(`/api/lessons/${id}`);
      fetchLessons();
    } catch (err) {
      alert('Gagal menghapus');
    }
  }

  const getContentTypeLabel = (type) => {
    const labels = {
      video: '🎬 Video',
      text: '📝 Teks',
      file: '📎 File',
      quiz: '📝 Kuis',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Materi</h2>
              <p className="text-gray-600">Modul: {module?.title || 'Loading...'}</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Tambah Materi
            </button>
          </div>
          {loading ? (
            <p>Memuat...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Judul</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Urutan</th>
                    <th className="py-3 px-4">Gratis</th>
                    <th className="py-3 px-4">File</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-gray-500">Belum ada materi. Tambahkan materi pertama!</td>
                    </tr>
                  ) : (
                    lessons.map((lesson, index) => (
                      <tr key={lesson.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{lesson.title}</td>
                        <td className="py-3 px-4">{getContentTypeLabel(lesson.content_type)}</td>
                        <td className="py-3 px-4">{lesson.sort_order}</td>
                        <td className="py-3 px-4">
                          {lesson.is_free ? '✅ Ya' : '❌ Tidak'}
                        </td>
                        <td className="py-3 px-4">
                          {lesson.file_attachment ? (
                            <a
                              href={`http://localhost:8000/storage/${lesson.file_attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              📎 {lesson.original_filename || 'Download'}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {lesson.content_type === 'quiz' && (
                            <button
                              onClick={() => navigate(`/lessons/${lesson.id}/quiz`)}
                              className="text-purple-600 hover:text-purple-800 mr-2"
                            >
                              Kuis
                            </button>
                          )}
                          <button
                            onClick={() => openModal(lesson)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingLesson ? 'Edit Materi' : 'Tambah Materi'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Judul Materi*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tipe Materi*</label>
            <select
              name="content_type"
              value={formData.content_type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="text">Teks</option>
              <option value="video">Video</option>
              <option value="file">File</option>
              <option value="quiz">Kuis</option>
            </select>
          </div>

          {formData.content_type === 'video' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL Video (YouTube/Vimeo)</label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}

          {formData.content_type === 'text' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Konten Teks</label>
              <textarea
                name="content_text"
                value={formData.content_text}
                onChange={handleChange}
                rows="5"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}

          {formData.content_type === 'file' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Upload File (PDF/DOC/PPT, max 10MB)</label>
              <input
                type="file"
                name="file_attachment"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="w-full border rounded px-3 py-2"
              />
              {editingLesson && !fileAttachment && editingLesson?.file_attachment && (
                <p className="text-sm text-gray-500 mt-1">File saat ini: {editingLesson.file_attachment}</p>
              )}
            </div>
          )}

          <div className="mb-4">
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

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Materi Gratis (Preview)</span>
            </label>
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

export default Lessons;
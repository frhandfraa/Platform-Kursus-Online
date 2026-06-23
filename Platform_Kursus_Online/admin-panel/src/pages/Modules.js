import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Modules = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({ title: '', sort_order: 0 });
  const navigate = useNavigate();

  // Pastikan courseId ada
  useEffect(() => {
    if (!courseId) {
      console.error('courseId tidak ada, redirect ke /courses');
      navigate('/courses');
      return;
    }
    console.log('courseId:', courseId);
    fetchUser();
    fetchCourse();
    fetchModules();
  }, [courseId]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      setUser(res.data);
    } catch (err) {
      console.error('Gagal fetch user:', err);
      navigate('/login');
    }
  };

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/api/courses/${courseId}`);
      setCourse(res.data);
    } catch (err) {
      console.error('Gagal ambil kursus:', err);
    }
  };

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/courses/${courseId}/modules`);
      console.log('Data modules:', res.data);
      setModules(res.data);
    } catch (err) {
      console.error('Gagal ambil modul:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({ title: module.title, sort_order: module.sort_order || 0 });
    } else {
      setEditingModule(null);
      setFormData({ title: '', sort_order: 0 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingModule(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await api.put(`/api/modules/${editingModule.id}`, formData);
      } else {
        await api.post(`/api/courses/${courseId}/modules`, formData);
      }
      closeModal();
      fetchModules();
    } catch (err) {
      alert('Gagal menyimpan modul');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus modul ini?')) return;
    try {
      await api.delete(`/api/modules/${id}`);
      fetchModules();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  // Navigasi ke halaman materi, pastikan modul memiliki id
  const goToLessons = (moduleId) => {
    console.log('Navigasi ke modul ID:', moduleId);
    if (!moduleId) {
      alert('ID modul tidak valid!');
      return;
    }
    navigate(`/modules/${moduleId}/lessons`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Modul</h2>
              <p className="text-gray-600">Kursus: {course?.title || 'Loading...'}</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Tambah Modul
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
                    <th className="py-3 px-4">Urutan</th>
                    <th className="py-3 px-4">Jumlah Materi</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-500">Belum ada modul. Tambahkan modul pertama!</td>
                    </tr>
                  ) : (
                    modules.map((mod, index) => (
                      <tr key={mod.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{mod.title}</td>
                        <td className="py-3 px-4">{mod.sort_order}</td>
                        <td className="py-3 px-4">{mod.lessons?.length || 0}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => goToLessons(mod.id)}
                            className="text-green-600 hover:text-green-800 mr-2"
                          >
                            Materi
                          </button>
                          <button
                            onClick={() => openModal(mod)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(mod.id)}
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingModule ? 'Edit Modul' : 'Tambah Modul'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Judul Modul*</label>
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

export default Modules;
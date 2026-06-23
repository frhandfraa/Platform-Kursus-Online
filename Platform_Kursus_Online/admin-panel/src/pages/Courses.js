import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Pemula',
    price: 0,
    duration_hours: 0,
    is_published: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      setUser(res.data);
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'Pemula',
        price: course.price || 0,
        duration_hours: course.duration_hours || 0,
        is_published: course.is_published || false,
      });
      setThumbnailPreview(course.thumbnail ? `http://localhost:8000/storage/${course.thumbnail}` : null);
      setThumbnailFile(null);
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        level: 'Pemula',
        price: 0,
        duration_hours: 0,
        is_published: false,
      });
      setThumbnailPreview(null);
      setThumbnailFile(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCourse(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
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
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };


  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'is_published') {
        formDataToSend.append(key, formData[key] ? 1 : 0);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (thumbnailFile) {
      formDataToSend.append('thumbnail', thumbnailFile);
    }
    if (editingCourse) {
      formDataToSend.append('_method', 'PUT');
      await api.post(`/api/courses/${editingCourse.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await api.post('/api/courses', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    closeModal();
    fetchCourses();
  } catch (err) {
    alert('Gagal menyimpan kursus');
    console.error(err);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kursus ini?')) return;
    try {
      await api.delete(`/api/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manajemen Kursus</h2>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Tambah Kursus
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
                    <th className="py-3 px-4">Thumbnail</th>
                    <th className="py-3 px-4">Judul</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        {course.thumbnail ? (
                          <img 
                            src={`http://localhost:8000/storage/${course.thumbnail}`} 
                            alt={course.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{course.title}</td>
                      <td className="py-3 px-4">{course.category || '-'}</td>
                      <td className="py-3 px-4">{course.level}</td>
                      <td className="py-3 px-4">{formatRupiah(course.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{course.is_published ? 'Published' : 'Draft'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/courses/${course.id}/modules`)}
                          className="text-green-600 hover:text-green-800 mr-2"
                        >
                          Modul
                        </button>
                        <button
                          onClick={() => openModal(course)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingCourse ? 'Edit Kursus' : 'Tambah Kursus'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Judul*</label>
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
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Pemula">Pemula</option>
                <option value="Menengah">Menengah</option>
                <option value="Mahir">Mahir</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Harga</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durasi (jam)</label>
              <input
                type="number"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                step="0.5"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Thumbnail</label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full border rounded px-3 py-2"
            />
            {thumbnailPreview && (
              <div className="mt-2">
                <img src={thumbnailPreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
            {editingCourse && !thumbnailFile && editingCourse?.thumbnail && (
             <p className="text-sm text-gray-500 mt-1">Thumbnail saat ini: {editingCourse.thumbnail}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Publikasikan</span>
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

export default Courses;
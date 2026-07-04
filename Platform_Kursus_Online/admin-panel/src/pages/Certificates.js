import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchCertificates();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      setUser(res.data);
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/certificates');
      setCertificates(res.data);
    } catch (err) {
      console.error('Gagal ambil sertifikat:', err);
      alert('Gagal memuat data sertifikat');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (e) {}
    localStorage.clear();
    navigate('/login');
  };

  const handleDownload = async (id) => {
    try {
      window.open(`http://localhost:8000/api/certificates/${id}/download`, '_blank');
    } catch (err) {
      alert('Gagal download sertifikat');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Manajemen Sertifikat</h2>
          {loading ? (
            <p>Memuat...</p>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              Belum ada sertifikat yang dikeluarkan.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Kursus</th>
                    <th className="py-3 px-4">Nomor Sertifikat</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, index) => (
                    <tr key={cert.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{cert.user?.name || '-'}</td>
                      <td className="py-3 px-4">{cert.course?.title || '-'}</td>
                      <td className="py-3 px-4">{cert.certificate_number}</td>
                      <td className="py-3 px-4">
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDownload(cert.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                        >
                          Download
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
    </div>
  );
};

export default Certificates;
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Certificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/api/certificates');
        setCertificates(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) return <div className="text-center py-8">Memuat...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sertifikat Saya</h1>
      {certificates.length === 0 ? (
        <p className="text-gray-500">Belum ada sertifikat.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="border rounded-lg p-4 shadow">
              <h2 className="text-xl font-semibold">{cert.course?.title}</h2>
              <p className="text-gray-600">No. Sertifikat: {cert.certificate_number}</p>
              <p className="text-sm text-gray-500">Diterbitkan: {new Date(cert.issued_at).toLocaleDateString()}</p>
              <a
                href={`http://localhost:8000/api/certificates/${cert.id}/download`}
                className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                📥 Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificate;
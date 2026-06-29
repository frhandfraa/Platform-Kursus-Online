import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QuizTake = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!lessonId) {
      setError('ID materi tidak valid');
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/api/lessons/${lessonId}/quiz`);
        if (res.data && res.data.id) {
          setQuizData(res.data);
        } else {
          setError('Kuis tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetch quiz:', err);
        if (err.response?.status === 404) {
          setError('Kuis belum tersedia untuk materi ini');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat kuis');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: { option_id: optionId } });
  };

  const handleEssayChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: { essay_answer: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!quizData?.id) {
      alert('ID kuis tidak valid');
      return;
    }

    setSubmitting(true);

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      question_id: parseInt(questionId),
      option_id: answers[questionId]?.option_id || null,
      essay_answer: answers[questionId]?.essay_answer || null,
    }));

    try {
      const res = await api.post(`/api/quizzes/${quizData.id}/submit`, {
        answers: formattedAnswers,
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal submit kuis');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Memuat kuis...</div>;
  if (error) return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );

  if (!quizData || !quizData.id) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Kuis Tidak Tersedia</h2>
          <p className="text-yellow-600">Kuis belum dibuat untuk materi ini.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { remaining, can_attempt, max_attempts } = quizData;

  if (!can_attempt) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">⛔ Batas Percobaan Tercapai</h2>
          <p className="text-yellow-600">Anda sudah mencapai batas maksimal percobaan ({max_attempts} kali).</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className={`rounded-lg p-6 text-center ${result.is_passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <h2 className="text-2xl font-bold mb-2">{result.is_passed ? '🎉 Selamat!' : '😔 Belum Lulus'}</h2>
          <p className="text-lg">Nilai Anda: <strong>{result.score}%</strong></p>
          <p className="text-sm text-gray-600 mt-2">{result.message}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{quizData.title}</h1>
      <div className="flex gap-4 text-sm text-gray-600 mb-6">
        <span>⏱️ {quizData.time_limit > 0 ? `${quizData.time_limit} menit` : 'Tidak terbatas'}</span>
        <span>✅ Nilai lulus: {quizData.passing_score}%</span>
        <span>📝 Sisa percobaan: {remaining} dari {max_attempts}</span>
      </div>

      <form onSubmit={handleSubmit}>
        {quizData.questions?.map((q, index) => (
          <div key={q.id} className="bg-white rounded-lg shadow p-4 mb-4">
            <p className="font-semibold mb-2">{index + 1}. {q.question_text}</p>
            {q.type === 'multiple_choice' ? (
              <div className="space-y-2">
                {q.options?.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={opt.id}
                      onChange={() => handleOptionChange(q.id, opt.id)}
                      className="w-4 h-4"
                    />
                    <span>{opt.option_text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                rows="3"
                placeholder="Tulis jawaban Anda di sini..."
                className="w-full border rounded px-3 py-2"
                onChange={(e) => handleEssayChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
        </button>
      </form>
    </div>
  );
};

export default QuizTake;
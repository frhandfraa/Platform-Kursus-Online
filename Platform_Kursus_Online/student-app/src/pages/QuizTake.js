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
    const fetchQuiz = async () => {
      if (!lessonId) {
        setError('ID materi tidak valid');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/lessons/${lessonId}/quiz`);
        
        // Cek apakah response memiliki data quiz
        if (res.data && res.data.id) {
          // Format response langsung dari API (tanpa wrapper)
          setQuizData({
            quiz: res.data,
            attempts: res.data.attempts || 0,
            remaining: res.data.remaining || 0,
            max_attempts: res.data.max_attempts || 1,
            can_attempt: res.data.remaining > 0,
          });
        } else if (res.data && res.data.quiz) {
          // Format dengan wrapper (jika ada)
          setQuizData(res.data);
        } else {
          setError('Kuis tidak ditemukan atau belum tersedia');
        }
      } catch (err) {
        console.error('Error fetch quiz:', err);
        if (err.response?.status === 404) {
          setError('Kuis belum dibuat untuk materi ini');
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
    if (!quizData?.quiz?.id) {
      alert('ID kuis tidak valid');
      return;
    }

    setSubmitting(true);

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      question_id: parseInt(questionId),
      option_id: answers[questionId]?.option_id || null,
      essay_answer: answers[questionId]?.essay_answer || null,
    }));

    // Validasi: pastikan semua soal dijawab
    const totalQuestions = quizData.quiz.questions?.length || 0;
    if (formattedAnswers.length < totalQuestions) {
      alert('Harap jawab semua soal terlebih dahulu!');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post(`/api/quizzes/${quizData.quiz.id}/submit`, {
        answers: formattedAnswers,
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal submit kuis');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat kuis...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Kuis Tidak Tersedia</h2>
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

  // Jika data tidak lengkap
  if (!quizData || !quizData.quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Kuis Belum Tersedia</h2>
          <p className="text-gray-600 mb-4">Instruktur belum membuat kuis untuk materi ini.</p>
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

  const { quiz, remaining, max_attempts, can_attempt } = quizData;

  // Jika sudah mencapai batas percobaan
  if (!can_attempt) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-5xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">Batas Percobaan Tercapai</h2>
          <p className="text-yellow-600">
            Anda sudah mencapai batas maksimal percobaan ({max_attempts} kali).
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Jika sudah selesai (result)
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10">
        <div className={`rounded-lg p-6 text-center ${result.is_passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <div className="text-5xl mb-4">{result.is_passed ? '🎉' : '😔'}</div>
          <h2 className="text-2xl font-bold mb-2">{result.is_passed ? 'Selamat!' : 'Belum Lulus'}</h2>
          <p className="text-lg">Nilai Anda: <strong>{result.score}%</strong></p>
          <p className="text-sm text-gray-600 mt-2">{result.message}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Tampilkan kuis
  return (
    <div className="max-w-3xl mx-auto p-6 mt-6">
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
        <span>⏱️ {quiz.time_limit > 0 ? `${quiz.time_limit} menit` : 'Tidak terbatas'}</span>
        <span>✅ Nilai lulus: {quiz.passing_score}%</span>
        <span>📝 Sisa percobaan: {remaining} dari {max_attempts}</span>
      </div>

      <form onSubmit={handleSubmit}>
        {quiz.questions?.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-700">Belum ada soal untuk kuis ini.</p>
          </div>
        ) : (
          quiz.questions?.map((q, index) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-100">
              <p className="font-semibold mb-3">
                {index + 1}. {q.question_text}
                <span className="text-sm text-gray-400 ml-2">({q.score} poin)</span>
              </p>
              {q.type === 'multiple_choice' ? (
                <div className="space-y-2 ml-4">
                  {q.options?.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={opt.id}
                        onChange={() => handleOptionChange(q.id, opt.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{opt.option_text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="ml-4">
                  <textarea
                    rows="3"
                    placeholder="Tulis jawaban Anda di sini..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    onChange={(e) => handleEssayChange(q.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))
        )}

        {quiz.questions?.length > 0 && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
          </button>
        )}
      </form>
    </div>
  );
};

export default QuizTake;
<?php

namespace App\Http\Controllers\Api;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class QuizAttemptController extends Controller
{
    // Mulai mengerjakan kuis
    public function start(Quiz $quiz)
    {
        // Cek apakah user sudah pernah mengerjakan
        $attempts = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quiz->id)
            ->count();

        // Cek batas percobaan
        if ($quiz->max_attempts > 0 && $attempts >= $quiz->max_attempts) {
            return response()->json([
                'message' => 'Anda sudah mencapai batas maksimal percobaan'
            ], 403);
        }

        // Cek apakah ada attempt yang belum selesai
        $active = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quiz->id)
            ->whereNull('finished_at')
            ->first();

        if ($active) {
            return response()->json([
                'message' => 'Anda masih memiliki kuis yang belum selesai',
                'attempt' => $active
            ]);
        }

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => Auth::id(),
            'attempt_number' => $attempts + 1,
            'started_at' => now(),
            'score' => 0,
            'is_passed' => false,
        ]);

        return response()->json([
            'message' => 'Kuis dimulai',
            'attempt' => $attempt,
            'questions' => $quiz->questions()->with('options')->orderBy('sort_order')->get()
        ]);
    }

    // Submit jawaban
    public function submit(Request $request, Quiz $quiz)
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.option_id' => 'nullable|exists:question_options,id',
            'answers.*.answer_text' => 'nullable|string'
        ]);

        // Cari attempt yang aktif
        $attempt = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quiz->id)
            ->whereNull('finished_at')
            ->first();

        if (!$attempt) {
            return response()->json(['message' => 'Tidak ada kuis yang sedang dikerjakan'], 404);
        }

        $totalScore = 0;
        $maxScore = 0;
        $correctAnswers = 0;
        $totalQuestions = $quiz->questions()->count();

        // Proses setiap jawaban
        foreach ($request->answers as $answerData) {
            $question = \App\Models\Question::with('options')->find($answerData['question_id']);
            $isCorrect = false;

            if ($question->type === 'multiple_choice') {
                // Cek apakah jawaban benar
                $selectedOption = $question->options->firstWhere('id', $answerData['option_id']);
                if ($selectedOption && $selectedOption->is_correct) {
                    $isCorrect = true;
                    $totalScore += $question->score ?? 1;
                    $correctAnswers++;
                }

                QuizAnswer::create([
                    'quiz_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'question_option_id' => $answerData['option_id'],
                    'is_correct' => $isCorrect
                ]);
            } else {
                // Essay - simpan jawaban, belum dinilai otomatis
                QuizAnswer::create([
                    'quiz_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'answer_text' => $answerData['answer_text'] ?? '',
                    'is_correct' => false
                ]);
            }

            $maxScore += $question->score ?? 1;
        }

        // Hitung passing
        $scorePercentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100) : 0;
        $isPassed = $scorePercentage >= ($quiz->passing_score ?? 70);

        // Update attempt
        $attempt->update([
            'score' => $scorePercentage,
            'is_passed' => $isPassed,
            'finished_at' => now()
        ]);

        return response()->json([
            'message' => 'Kuis selesai!',
            'score' => $scorePercentage,
            'is_passed' => $isPassed,
            'correct_answers' => $correctAnswers,
            'total_questions' => $totalQuestions,
            'attempt' => $attempt
        ]);
    }

    // Lihat hasil kuis
    public function result(Quiz $quiz)
    {
        $attempt = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quiz->id)
            ->whereNotNull('finished_at')
            ->orderBy('id', 'desc')
            ->first();

        if (!$attempt) {
            return response()->json(['message' => 'Belum ada hasil kuis'], 404);
        }

        return response()->json([
            'attempt' => $attempt,
            'answers' => $attempt->answers()->with(['question', 'option'])->get(),
            'questions' => $quiz->questions()->with('options')->get()
        ]);
    }
}
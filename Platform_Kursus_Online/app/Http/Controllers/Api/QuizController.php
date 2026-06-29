<?php

namespace App\Http\Controllers\Api;

use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    public function show(Lesson $lesson)
    {
        $quiz = $lesson->quiz()->with(['questions.options'])->first();
        
        if (!$quiz) {
            return response()->json(['message' => 'Kuis tidak ditemukan'], 404);
        }

        // Jika user login, hitung attempts
        $attempts = 0;
        $remaining = 0;
        if (Auth::check()) {
            $attempts = QuizAttempt::where('quiz_id', $quiz->id)
                                   ->where('user_id', Auth::id())
                                   ->count();
            $remaining = max(0, $quiz->max_attempts - $attempts);
        }

        return response()->json([
            'id' => $quiz->id,
            'lesson_id' => $quiz->lesson_id,
            'title' => $quiz->title,
            'time_limit' => $quiz->time_limit,
            'passing_score' => $quiz->passing_score,
            'max_attempts' => $quiz->max_attempts,
            'questions' => $quiz->questions,
            'attempts' => $attempts,
            'remaining' => $remaining,
            'can_attempt' => $remaining > 0,
            'created_at' => $quiz->created_at,
            'updated_at' => $quiz->updated_at,
        ]);
    }

    public function store(Request $request, Lesson $lesson)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1'
        ]);

        $quiz = $lesson->quiz()->create($request->all());
        
        // Reload dengan relasi questions
        $quiz->load('questions');
        
        return response()->json($quiz, 201);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1'
        ]);

        $quiz->update($request->all());
        $quiz->load('questions');
        
        return response()->json($quiz);
    }

    public function destroy(Quiz $quiz)
    {
        $quiz->delete();
        return response()->json(['message' => 'Kuis berhasil dihapus']);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        // Cek apakah user sudah mencapai batas
        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
                               ->where('user_id', Auth::id())
                               ->count();

        if ($attempts >= $quiz->max_attempts) {
            return response()->json([
                'message' => 'Anda sudah mencapai batas maksimal percobaan',
                'can_attempt' => false
            ], 403);
        }

        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.option_id' => 'nullable|exists:question_options,id',
            'answers.*.essay_answer' => 'nullable|string',
        ]);

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => Auth::id(),
            'attempt_number' => $attempts + 1,
            'started_at' => now(),
            'finished_at' => now(),
        ]);

        $totalScore = 0;
        $maxScore = 0;

        foreach ($request->answers as $answerData) {
            $question = $quiz->questions()->find($answerData['question_id']);
            if (!$question) continue;

            $maxScore += $question->score;

            $isCorrect = false;
            $scoreEarned = 0;

            if ($question->type === 'multiple_choice') {
                $selectedOption = $question->options()->find($answerData['option_id']);
                if ($selectedOption && $selectedOption->is_correct) {
                    $isCorrect = true;
                    $scoreEarned = $question->score;
                }
            }

            $totalScore += $scoreEarned;

            QuizAttemptAnswer::create([
                'quiz_attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'selected_option_id' => $answerData['option_id'] ?? null,
                'essay_answer' => $answerData['essay_answer'] ?? null,
                'is_correct' => $isCorrect,
                'score_earned' => $scoreEarned,
            ]);
        }

        $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100) : 0;
        $isPassed = $percentage >= $quiz->passing_score;

        $attempt->update([
            'score' => $percentage,
            'is_passed' => $isPassed,
            'finished_at' => now(),
        ]);

        return response()->json([
            'message' => $isPassed ? 'Selamat, Anda lulus!' : 'Anda belum mencapai nilai minimum.',
            'score' => $percentage,
            'is_passed' => $isPassed,
            'attempt' => $attempt,
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    public function index(Quiz $quiz)
    {
        return $quiz->questions()->with('options')->orderBy('sort_order')->get();
    }

    public function store(Request $request, Quiz $quiz)
    {
        $request->validate([
            'question_text' => 'required|string',
            'type' => 'in:multiple_choice,essay',
            'score' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'options' => 'nullable|array',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'nullable|boolean'
        ]);

        $question = $quiz->questions()->create([
            'question_text' => $request->question_text,
            'type' => $request->type ?? 'multiple_choice',
            'score' => $request->score ?? 1,
            'sort_order' => $request->sort_order ?? 0
        ]);

        if ($request->type === 'multiple_choice' && isset($request->options)) {
            foreach ($request->options as $opt) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct'] ?? false
                ]);
            }
        }

        return response()->json($question->load('options'), 201);
    }

    public function update(Request $request, Question $question)
    {
        $question->update($request->all());
        return response()->json($question);
    }

    public function destroy(Question $question)
    {
        $question->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function show(Lesson $lesson)
    {
        $quiz = $lesson->quiz()->with('questions.options')->first();

        if (!$quiz) {
            return response()->json(['message' => 'Kuis tidak ditemukan'], 404);
        }

        // Ambil data percobaan user
        $user = Auth::user();
        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->orderBy('attempt_number', 'desc')
            ->get();

        $totalAttempts = $attempts->count();
        $maxAttempts = $quiz->max_attempts;
        $remainingAttempts = max(0, $maxAttempts - $totalAttempts);
        $canAttempt = $remainingAttempts > 0;

        // Cek apakah sudah lulus
        $passed = $attempts->contains('is_passed', true);

        return response()->json([
            'quiz' => $quiz,
            'total_attempts' => $totalAttempts,
            'max_attempts' => $maxAttempts,
            'remaining_attempts' => $remainingAttempts,
            'can_attempt' => $canAttempt,
            'passed' => $passed,
        ]);
    }
    public function resetAttempts(Quiz $quiz)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hapus semua attempts untuk quiz ini
        QuizAttempt::where('quiz_id', $quiz->id)->delete();

        return response()->json(['message' => 'Semua attempts berhasil direset']);
    }
}

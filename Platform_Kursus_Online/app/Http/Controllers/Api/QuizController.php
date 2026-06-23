<?php

namespace App\Http\Controllers\Api;

use App\Models\Lesson;
use App\Models\Quiz;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class QuizController extends Controller
{
    public function show(Lesson $lesson)
    {
        return $lesson->quiz()->with('questions.options')->first();
    }

    public function store(Request $request, Lesson $lesson)
    {
        $request->validate([
            'title' => 'required|string',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1'
        ]);

        $quiz = $lesson->quiz()->create($request->all());
        return response()->json($quiz, 201);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $quiz->update($request->all());
        return response()->json($quiz);
    }

    public function destroy(Quiz $quiz)
    {
        $quiz->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
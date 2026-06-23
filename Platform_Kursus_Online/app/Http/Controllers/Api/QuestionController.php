<?php

namespace App\Http\Controllers\Api;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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
}
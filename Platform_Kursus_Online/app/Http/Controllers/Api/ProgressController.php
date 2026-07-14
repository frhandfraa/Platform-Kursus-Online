<?php

namespace App\Http\Controllers\Api;

use App\Models\Lesson;
use App\Models\UserLessonProgress;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    public function toggleComplete(Lesson $lesson)
    {
        $progress = UserLessonProgress::where('user_id', Auth::id())
            ->where('lesson_id', $lesson->id)
            ->first();

        if ($progress) {
            $progress->completed = !$progress->completed;
            $progress->completed_at = $progress->completed ? now() : null;
            $progress->save();
            $completed = $progress->completed;
        } else {
            $progress = UserLessonProgress::create([
                'user_id' => Auth::id(),
                'lesson_id' => $lesson->id,
                'completed' => true,
                'completed_at' => now(),
            ]);
            $completed = true;
        }

        // Hitung progress untuk enrollment
        $course = $lesson->module->course;
        $allLessonIds = $course->modules->flatMap->lessons->pluck('id');
        $completedCount = UserLessonProgress::where('user_id', Auth::id())
            ->whereIn('lesson_id', $allLessonIds)
            ->where('completed', true)
            ->count();
        $totalLessons = $allLessonIds->count();
        $progressPercent = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100) : 0;

        // Update enrollment
        $enrollment = \App\Models\Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();
        if ($enrollment) {
            $enrollment->progress_percent = $progressPercent;
            if ($progressPercent >= 100) {
                $enrollment->status = 'completed';
                $enrollment->completed_at = now();
            }
            $enrollment->save();
        }

        return response()->json([
            'completed' => $completed,
            'progress_percent' => $progressPercent,
        ]);
    }
}
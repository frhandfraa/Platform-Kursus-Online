<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\UserLessonProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class EnrollmentController extends Controller
{
    /**
     * Daftar enrollment user yang sedang login
     */
    public function index()
    {
        $enrollments = Enrollment::with(['course', 'course.instructor'])
            ->where('user_id', Auth::id())
            ->orderBy('enrolled_at', 'desc')
            ->get();

        return response()->json($enrollments);
    }

    /**
     * Enroll ke kursus
     */
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id'
        ]);

        $course = Course::find($request->course_id);

        // Cek apakah sudah pernah enroll
        $existing = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah terdaftar di kursus ini',
                'enrollment' => $existing
            ], 409);
        }

        $enrollment = Enrollment::create([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'status' => 'active',
            'progress_percent' => 0,
        ]);

        return response()->json([
            'message' => 'Berhasil mendaftar',
            'enrollment' => $enrollment->load('course')
        ], 201);
    }

    /**
     * Detail enrollment
     */
    public function show(Enrollment $enrollment)
    {
        if ($enrollment->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollment->load(['course.modules.lessons']);

        // Ambil completed lessons dari user_lesson_progress
        $completedLessons = UserLessonProgress::where('user_id', Auth::id())
            ->whereIn('lesson_id', $enrollment->course->modules->flatMap->lessons->pluck('id'))
            ->where('completed', true)
            ->pluck('lesson_id');

        return response()->json([
            'id' => $enrollment->id,
            'course' => $enrollment->course,
            'progress_percent' => $enrollment->progress_percent,
            'status' => $enrollment->status,
            'completed_lessons' => $completedLessons,
        ]);
    }

    /**
     * Update progress (misal dari siswa)
     */
    public function update(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'progress_percent' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,completed,dropped',
        ]);

        $enrollment->update($request->only(['progress_percent', 'status']));

        // Jika status completed, beri sertifikat (opsional)
        if ($enrollment->status === 'completed' && $enrollment->progress_percent >= 100) {
            // Nanti bisa trigger CertificateController@generate
        }

        return response()->json($enrollment);
    }

    /**
     * Drop enrollment (batal mengikuti)
     */
    public function destroy(Enrollment $enrollment)
    {
        if ($enrollment->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollment->delete();
        return response()->json(['message' => 'Berhasil dibatalkan']);
    }

    /**
     * Admin: lihat semua enrollment
     */
    public function adminIndex()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Enrollment::with(['user', 'course'])->get();
    }

    /**
     * Admin: lihat enrollment per kursus
     */
    public function byCourse($courseId)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollments = Enrollment::with('user')
            ->where('course_id', $courseId)
            ->get();

        return response()->json($enrollments);
    }
    public function completeLesson(Enrollment $enrollment, Lesson $lesson)
    {
        // Cek apakah lesson milik course yang sama
        if ($enrollment->course_id !== $lesson->module->course_id) {
            return response()->json(['message' => 'Materi tidak ada di kursus ini'], 422);
        }

        // Tandai selesai
        $enrollment->completedLessons()->syncWithoutDetaching([$lesson->id => ['is_completed' => true]]);

        // Hitung ulang progress
        $totalLessons = $enrollment->course->modules->flatMap->lessons->count();
        $completedCount = $enrollment->completedLessons()->wherePivot('is_completed', true)->count();
        $progress = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100, 2) : 0;

        $enrollment->update(['progress_percent' => $progress]);

        // Jika progress 100%, otomatis status completed
        if ($progress >= 100) {
            $enrollment->update(['status' => 'completed', 'completed_at' => now()]);
            // Trigger sertifikat di sini nanti
        }

        return response()->json([
            'message' => 'Materi ditandai selesai',
            'progress' => $progress,
            'status' => $enrollment->status
        ]);
    }
}

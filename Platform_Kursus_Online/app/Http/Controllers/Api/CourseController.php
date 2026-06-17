<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function index()
    {
        // Admin & Instructor lihat semua, Student lihat yang published
        if (Auth::user()->role == 'student') {
            return Course::with('instructor')->where('is_published', true)->get();
        }
        return Course::with('instructor')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'level' => 'in:Pemula,Menengah,Mahir'
        ]);

        $course = Course::create([
            'instructor_id' => Auth::id(), // Otomatis mengambil user yang login
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'duration_hours' => $request->duration_hours,
            'price' => $request->price,
            'level' => $request->level,
            'is_published' => $request->is_published ?? false
        ]);

        return response()->json($course, 201);
    }

    public function update(Request $request, Course $course)
    {
        // Cek akses: hanya admin atau instruktur pemilik kursus
        if (Auth::user()->role != 'admin' && Auth::id() != $course->instructor_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->update($request->all());
        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        if (Auth::user()->role != 'admin' && Auth::id() != $course->instructor_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $course->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
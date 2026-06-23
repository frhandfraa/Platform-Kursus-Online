<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index()
    {
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
            'category' => 'nullable|string|max:50',
            'level' => 'in:Pemula,Menengah,Mahir',
            'price' => 'numeric|min:0',
            'duration_hours' => 'numeric|min:0',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_published' => 'boolean'
        ]);

        $data = [
            'instructor_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'level' => $request->level ?? 'Pemula',
            'price' => $request->price ?? 0,
            'duration_hours' => $request->duration_hours ?? 0,
            'is_published' => $request->is_published ?? false
        ];

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $data['thumbnail'] = $path;
        }

        $course = Course::create($data);
        return response()->json($course, 201);
    }

    public function show(Course $course)
    {
        return response()->json($course->load('instructor'));
    }

    public function update(Request $request, Course $course)
    {
        if (Auth::user()->role != 'admin' && Auth::id() != $course->instructor_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'level' => 'in:Pemula,Menengah,Mahir',
            'price' => 'numeric|min:0',
            'duration_hours' => 'numeric|min:0',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_published' => 'boolean'
        ]);

        $data = $request->all();

        if ($request->hasFile('thumbnail')) {
            // Hapus thumbnail lama jika ada
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $data['thumbnail'] = $path;
        }

        $course->update($data);
        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        if (Auth::user()->role != 'admin' && Auth::id() != $course->instructor_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // Hapus thumbnail jika ada
        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }
        $course->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
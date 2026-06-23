<?php

namespace App\Http\Controllers\Api;

use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    public function index(Module $module)
    {
        return $module->lessons()->orderBy('sort_order')->get();
    }

    public function store(Request $request, Module $module)
    {
        $request->validate([
            'title' => 'required|string',
            'content_type' => 'in:video,text,file,quiz',
            'video_url' => 'nullable|url',
            'content_text' => 'nullable|string',
            'file_attachment' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:10240', // 10MB
            'sort_order' => 'nullable|integer',
            'is_free' => 'nullable|in:0,1', // menerima 0 atau 1
        ]);

        $data = $request->all();

        if ($request->hasFile('file_attachment')) {
            $file = $request->file('file_attachment');
            $path = $file->store('attachments', 'public');
            $data['file_attachment'] = $path;
            $data['original_filename'] = $file->getClientOriginalName(); // simpan nama asli
        }

        $lesson = $module->lessons()->create($data);
        return response()->json($lesson, 201);
    }

    public function update(Request $request, Lesson $lesson)
    {
        $request->validate([
            'title' => 'sometimes|string',
            'content_type' => 'sometimes|in:video,text,file,quiz',
            'video_url' => 'nullable|url',
            'content_text' => 'nullable|string',
            'file_attachment' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:10240',
            'sort_order' => 'nullable|integer',
            'is_free' => 'nullable|in:0,1', // menerima 0 atau 1
        ]);

        $data = $request->all();

        if ($request->hasFile('file_attachment')) {
            // Hapus file lama jika ada
            if ($lesson->file_attachment) {
                Storage::disk('public')->delete($lesson->file_attachment);
            }
            $path = $request->file('file_attachment')->store('attachments', 'public');
            $data['file_attachment'] = $path;
        }

        $lesson->update($data);
        return response()->json($lesson);
    }

    public function destroy(Lesson $lesson)
    {
        // Hapus file jika ada
        if ($lesson->file_attachment) {
            Storage::disk('public')->delete($lesson->file_attachment);
        }
        $lesson->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

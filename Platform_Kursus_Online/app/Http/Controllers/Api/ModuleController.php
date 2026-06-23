<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ModuleController extends Controller
{
    public function index(Course $course)
    {
        return $course->modules;
    }

    public function store(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'required|string',
            'sort_order' => 'nullable|integer'
        ]);

        $module = $course->modules()->create([
            'title' => $request->title,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json($module, 201);
    }

    public function update(Request $request, Module $module)
    {
        $module->update($request->all());
        return response()->json($module);
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
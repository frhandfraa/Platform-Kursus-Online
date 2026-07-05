<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalCourses = Course::count();
        $totalStudents = User::where('role', 'student')->count();
        $totalInstructors = User::where('role', 'instructor')->count();
        $totalRevenue = Enrollment::sum('price'); // Sesuaikan jika ada kolom price di enrollments

        return response()->json([
            'total_courses' => $totalCourses,
            'total_students' => $totalStudents,
            'total_instructors' => $totalInstructors,
            'total_revenue' => $totalRevenue,
        ]);
    }
}
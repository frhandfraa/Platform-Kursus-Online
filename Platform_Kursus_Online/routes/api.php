<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuizAttemptController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Auth Required)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public course listing (tanpa auth)
Route::get('/courses', [CourseController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Requires Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Course (CRUD hanya untuk yang sudah login)
    Route::post('/courses', [CourseController::class, 'store']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    Route::post('/courses/{course}/thumbnail', [CourseController::class, 'uploadThumbnail']);

    // Enrollment
    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);
    Route::get('/enrollments/{enrollment}', [EnrollmentController::class, 'show']);
    Route::put('/enrollments/{enrollment}', [EnrollmentController::class, 'update']);
    Route::delete('/enrollments/{enrollment}', [EnrollmentController::class, 'destroy']);

    // User (admin only)
    Route::apiResource('users', UserController::class)->only(['index', 'show', 'update', 'destroy']);

    // Category
    Route::apiResource('categories', CategoryController::class);

    // Module
    Route::get('/courses/{course}/modules', [ModuleController::class, 'index']);
    Route::post('/courses/{course}/modules', [ModuleController::class, 'store']);
    Route::put('/modules/{module}', [ModuleController::class, 'update']);
    Route::delete('/modules/{module}', [ModuleController::class, 'destroy']);

    // Lesson
    Route::get('/modules/{module}/lessons', [LessonController::class, 'index']);
    Route::post('/modules/{module}/lessons', [LessonController::class, 'store']);
    Route::put('/lessons/{lesson}', [LessonController::class, 'update']);
    Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);

    // Quiz
    Route::get('/lessons/{lesson}/quiz', [QuizController::class, 'show']);
    Route::post('/lessons/{lesson}/quiz', [QuizController::class, 'store']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->where('quiz', '[0-9]+');

    // Questions
    Route::get('/quizzes/{quiz}/questions', [QuestionController::class, 'index'])->where('quiz', '[0-9]+');
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store'])->where('quiz', '[0-9]+');
    Route::put('/questions/{question}', [QuestionController::class, 'update'])->where('question', '[0-9]+');
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->where('question', '[0-9]+');

    // Certificate
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::post('/certificates/{enrollment}', [CertificateController::class, 'generate']);
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download']);
    Route::get('/admin/certificates', [CertificateController::class, 'adminIndex'])->middleware('role:admin');

    // Quiz Attempts
    Route::post('/quizzes/{quiz}/start', [QuizAttemptController::class, 'start']);
    Route::post('/quizzes/{quiz}/submit', [QuizAttemptController::class, 'submit']);
    Route::get('/quizzes/{quiz}/result', [QuizAttemptController::class, 'result']);

    // Enrollment tambahan
    Route::post('/enroll', [EnrollmentController::class, 'store']);
    Route::post('/enroll/{course}', [EnrollmentController::class, 'enroll']);
    Route::get('/my-courses', [EnrollmentController::class, 'myCourses']);
    Route::get('/my-progress/{course}', [EnrollmentController::class, 'myProgress']);
});

// Admin only (jika butuh)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // tambahan admin specific jika ada
    Route::get('/admin/certificates', [CertificateController::class, 'adminIndex']);
});

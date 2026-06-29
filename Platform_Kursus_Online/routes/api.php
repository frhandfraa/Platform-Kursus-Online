<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuizAttemptController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/quizzes/{quiz}/start', [QuizAttemptController::class, 'start']);
    Route::post('/quizzes/{quiz}/submit', [QuizAttemptController::class, 'submit']);
    Route::get('/quizzes/{quiz}/result', [QuizAttemptController::class, 'result']);

    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);
    Route::get('/enrollments/{enrollment}', [EnrollmentController::class, 'show']);
    Route::put('/enrollments/{enrollment}', [EnrollmentController::class, 'update']);
    Route::delete('/enrollments/{enrollment}', [EnrollmentController::class, 'destroy']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit']);
    Route::get('/lessons/{lesson}/quiz', [QuizController::class, 'show']);
    Route::delete('/admin/quizzes/{quiz}/reset-attempts', [QuizController::class, 'resetAttempts'])
        ->middleware('role:admin');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);

    // Course
    Route::apiResource('courses', CourseController::class);

    // User (admin only)
    Route::apiResource('users', UserController::class)->only(['index', 'show', 'update', 'destroy']);

    // Category
    Route::apiResource('categories', CategoryController::class);

    // Module (nested di course)
    Route::get('/courses/{course}/modules', [ModuleController::class, 'index']);
    Route::post('/courses/{course}/modules', [ModuleController::class, 'store']);
    Route::put('/modules/{module}', [ModuleController::class, 'update']);
    Route::delete('/modules/{module}', [ModuleController::class, 'destroy']);

    // Lesson (nested di module)
    Route::get('/modules/{module}/lessons', [LessonController::class, 'index']);
    Route::post('/modules/{module}/lessons', [LessonController::class, 'store']);
    Route::put('/lessons/{lesson}', [LessonController::class, 'update']);
    Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);

    // Quiz (nested di lesson)
    Route::get('/lessons/{lesson}/quiz', [QuizController::class, 'show']);
    Route::post('/lessons/{lesson}/quiz', [QuizController::class, 'store']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit']);
    Route::delete('/admin/quizzes/{quiz}/reset-attempts', [QuizController::class, 'resetAttempts'])->middleware('role:admin');

    // Quiz routes dengan constraint numeric
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->where('quiz', '[0-9]+');
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update'])->where('quiz', '[0-9]+');
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy'])->where('quiz', '[0-9]+');
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit'])->where('quiz', '[0-9]+');

    // Questions routes dengan constraint numeric
    Route::get('/quizzes/{quiz}/questions', [QuestionController::class, 'index'])->where('quiz', '[0-9]+');
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store'])->where('quiz', '[0-9]+');
    Route::put('/questions/{question}', [QuestionController::class, 'update'])->where('question', '[0-9]+');
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->where('question', '[0-9]+');

    // Questions (nested di quiz)
    Route::get('/quizzes/{quiz}', [QuizController::class, 'getQuiz']);
    Route::get('/lessons/{lesson}/quiz', [QuizController::class, 'show']);
    Route::post('/lessons/{lesson}/quiz', [QuizController::class, 'store']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit']);
    Route::get('/quizzes/{quiz}/questions', [QuestionController::class, 'index']);
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{question}', [QuestionController::class, 'update']);

    // Certificate
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::post('/certificates/{enrollment}', [CertificateController::class, 'generate']);
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download']);
    Route::post('/courses/{course}/thumbnail', [CourseController::class, 'uploadThumbnail']);

    // Enrollment
    Route::post('/enroll', [EnrollmentController::class, 'store']);
    Route::post('/enroll/{course}', [EnrollmentController::class, 'enroll']);
    Route::get('/my-courses', [EnrollmentController::class, 'myCourses']);
    Route::get('/my-progress/{course}', [EnrollmentController::class, 'myProgress']);

    // Progress & completion
    Route::post('/lessons/{lesson}/complete', [ProgressController::class, 'markComplete']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
});

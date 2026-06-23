<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\CertificateController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

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

    // Quiz (nested di lesson)
    Route::get('/lessons/{lesson}/quiz', [QuizController::class, 'show']);
    Route::post('/lessons/{lesson}/quiz', [QuizController::class, 'store']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);

    // Questions (nested di quiz)
    Route::get('/quizzes/{quiz}/questions', [QuestionController::class, 'index']);
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{question}', [QuestionController::class, 'update']);
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);

    // Certificate
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::post('/certificates/{enrollment}', [CertificateController::class, 'generate']);
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download']);
    Route::post('/courses/{course}/thumbnail', [CourseController::class, 'uploadThumbnail']);
});

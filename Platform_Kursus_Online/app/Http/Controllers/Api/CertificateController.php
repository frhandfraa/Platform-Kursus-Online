<?php

namespace App\Http\Controllers\Api;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    public function index()
    {
        return Certificate::where('user_id', Auth::id())->get();
    }

    public function adminIndex()
    {
        // Pastikan user admin
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ambil semua sertifikat dengan relasi user dan course
        $certificates = Certificate::with(['user', 'course'])->get();
        return response()->json($certificates);
    }

    public function generate(Enrollment $enrollment)
    {
        if ($enrollment->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($enrollment->status !== 'completed' || $enrollment->progress_percent < 100) {
            return response()->json(['message' => 'Kursus belum selesai'], 400);
        }

        $existing = Certificate::where('enrollment_id', $enrollment->id)->first();
        if ($existing) {
            return response()->json($existing);
        }

        $cert = Certificate::create([
            'enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => 'CERT-' . strtoupper(Str::random(10)) . '-' . time(),
            'issued_at' => now(),
        ]);

        return response()->json($cert, 201);
    }

    public function download(Certificate $certificate)
    {
        if ($certificate->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Sementara return JSON
        return response()->json([
            'message' => 'Fitur download sertifikat akan segera hadir',
            'certificate' => $certificate
        ]);
    }
}

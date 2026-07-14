<?php

namespace App\Http\Controllers\Api;

use App\Models\Certificate;
use App\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class CertificateController extends Controller
{
    // Untuk siswa: lihat sertifikat sendiri
    public function index()
    {
        $certificates = Certificate::where('user_id', Auth::id())
            ->with(['course', 'user'])
            ->get();
        return response()->json($certificates);
    }

    // Untuk admin: lihat semua sertifikat
    public function adminIndex()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $certificates = Certificate::with(['user', 'course'])->get();
        return response()->json($certificates);
    }

    /**
     * Generate sertifikat (POST /api/certificates/{enrollment})
     */
    public function generate(Enrollment $enrollment)
    {
        // Cek akses
        if ($enrollment->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Cek apakah kursus sudah selesai
        if ($enrollment->status !== 'completed' || $enrollment->progress_percent < 100) {
            return response()->json(['message' => 'Kursus belum selesai'], 400);
        }

        // Cek apakah sudah ada sertifikat
        $existing = Certificate::where('enrollment_id', $enrollment->id)->first();
        if ($existing) {
            return response()->json($existing);
        }

        // Buat sertifikat baru
        $cert = Certificate::create([
            'enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => 'CERT-' . strtoupper(Str::random(10)) . '-' . time(),
            'issued_at' => now(),
        ]);

        return response()->json($cert, 201);
    }

    /**
     * Download sertifikat (GET /api/certificates/{certificate}/download)
     */
    public function download(Certificate $certificate)
    {
        // Cek akses
        if ($certificate->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Data untuk view PDF
        $data = [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'course' => $certificate->course,
            'date' => $certificate->issued_at ? $certificate->issued_at->format('d F Y') : now()->format('d F Y'),
        ];

        try {
            $pdf = PDF::loadView('certificates.pdf', $data);
$pdf->setPaper('a4', 'landscape');
return response($pdf->output(), 200)
    ->header('Content-Type', 'application/pdf')
    ->header('Content-Disposition', 'attachment; filename="sertifikat-' . $certificate->certificate_number . '.pdf"');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal generate PDF: ' . $e->getMessage()], 500);
        }
    }
}
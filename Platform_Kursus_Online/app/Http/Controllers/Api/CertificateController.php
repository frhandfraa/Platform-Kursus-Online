<?php

namespace App\Http\Controllers\Api;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use PDF;

class CertificateController extends Controller
{
    public function index()
    {
        $certificates = Certificate::where('user_id', Auth::id())
            ->with(['course', 'user'])
            ->orderBy('issued_at', 'desc')
            ->get();
        return response()->json($certificates);
    }

    public function generate(Enrollment $enrollment)
    {
        // Pastikan user yang mengakses adalah pemilik enrollment atau admin
        if ($enrollment->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Cek apakah enrollment sudah completed
        if ($enrollment->status !== 'completed') {
            return response()->json(['message' => 'Course not completed yet'], 400);
        }

        // Cek apakah sertifikat sudah pernah dibuat
        $existing = Certificate::where('enrollment_id', $enrollment->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Certificate already exists', 'certificate' => $existing], 409);
        }

        // Buat sertifikat
        $certificate = Certificate::create([
            'enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => 'CERT-' . strtoupper(Str::random(10)),
            'issued_at' => now(),
        ]);

        return response()->json($certificate, 201);
    }

    public function download(Certificate $certificate)
    {
        // Pastikan user yang mengakses adalah pemilik atau admin
        if ($certificate->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Data untuk view PDF
        $data = [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'course' => $certificate->course,
            'issued_at' => $certificate->issued_at->format('d F Y'),
        ];

        // Generate PDF (pastikan sudah install dompdf: composer require dompdf/dompdf)
        $pdf = PDF::loadView('pdf.certificate', $data);
        return $pdf->download('sertifikat-' . $certificate->certificate_number . '.pdf');
    }
}
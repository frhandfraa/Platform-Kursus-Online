<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sertifikat - {{ $certificate_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
        }
        .certificate {
            width: 100%;
            max-width: 800px;
            margin: 40px auto;
            padding: 50px 60px;
            background: white;
            border: 2px solid #1e3a8a;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            text-align: center;
            position: relative;
        }
        .border-decoration {
            border: 8px double #1e3a8a;
            padding: 40px;
            border-radius: 12px;
        }
        h1 {
            color: #1e3a8a;
            font-size: 36px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #4b5563;
            font-size: 18px;
            margin-bottom: 30px;
            letter-spacing: 2px;
        }
        .student-name {
            color: #1e3a8a;
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0 10px;
            border-bottom: 2px dashed #d1d5db;
            padding-bottom: 10px;
        }
        .course-title {
            color: #374151;
            font-size: 24px;
            margin: 15px 0;
            font-weight: 600;
        }
        .description {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.8;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #6b7280;
        }
        .cert-number {
            font-size: 12px;
            color: #9ca3af;
        }
        .seal {
            font-size: 48px;
            margin: 10px 0;
        }
        .signature {
            margin-top: 20px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border-decoration">
            <div class="seal">🎓</div>
            <h1>SERTIFIKAT KELULUSAN</h1>
            <p class="subtitle">Diberikan kepada</p>
            <div class="student-name">{{ $student_name }}</div>
            <p class="description">
                Telah menyelesaikan kursus <br>
                <span class="course-title">"{{ $course_title }}"</span>
                <br><br>
                dengan predikat <strong>LULUS</strong> pada tanggal {{ $issued_at }}
            </p>
            <div style="margin: 20px 0; font-size: 14px; color: #4b5563;">
                Instruktur: {{ $instructor_name }}
            </div>
            <div class="signature">
                <p style="margin: 0;">_________________________</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">Direktur LMS</p>
            </div>
            <div class="footer">
                <span>Nomor Sertifikat: {{ $certificate_number }}</span>
                <span>Diterbitkan: {{ $issued_at }}</span>
            </div>
        </div>
    </div>
</body>
</html>
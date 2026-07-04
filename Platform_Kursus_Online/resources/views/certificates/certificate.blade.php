<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sertifikat</title>
    <style>
        body { font-family: 'Arial', sans-serif; text-align: center; padding: 50px; }
        .container { border: 5px solid #1a56db; padding: 40px; border-radius: 20px; }
        h1 { font-size: 48px; color: #1a56db; }
        h2 { font-size: 32px; }
        .name { font-size: 36px; font-weight: bold; color: #1a56db; margin: 20px 0; }
        .course { font-size: 24px; }
        .footer { margin-top: 40px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Sertifikat</h1>
        <p>Diberikan kepada</p>
        <div class="name">{{ $cert->user->name }}</div>
        <p class="course">telah menyelesaikan kursus</p>
        <h2>{{ $cert->course->title }}</h2>
        <p>dengan predikat <strong>LULUS</strong></p>
        <p>Nomor Sertifikat: {{ $cert->certificate_number }}</p>
        <p>Dikeluarkan pada: {{ $cert->issued_at->format('d F Y') }}</p>
        <div class="footer">Platform LMS</div>
    </div>
</body>
</html>
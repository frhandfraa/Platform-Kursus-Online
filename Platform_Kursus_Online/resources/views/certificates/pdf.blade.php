<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sertifikat</title>
    <style>
        /* Reset dan font */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: #f0f4f8;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .certificate-wrapper {
            width: 1000px;
            max-width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            padding: 40px;
            border: 6px solid #1a56db;
            position: relative;
            overflow: hidden;
        }
        /* Background dekoratif */
        .certificate-wrapper::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 50%, rgba(26, 86, 219, 0.03) 0%, transparent 60%);
            pointer-events: none;
        }
        .certificate-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        /* Header: Logo + Judul */
        .cert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
        }
        .cert-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .cert-logo img {
            height: 60px;
            width: auto;
        }
        .cert-logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #1a56db;
            letter-spacing: 1px;
        }
        .cert-title {
            text-align: right;
        }
        .cert-title h1 {
            font-size: 28px;
            color: #1a56db;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 800;
        }
        .cert-title .sub {
            font-size: 14px;
            color: #6b7280;
            letter-spacing: 2px;
        }
        /* Badge Sertifikat */
        .cert-badge {
            background: #1a56db;
            color: white;
            padding: 8px 25px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 10px 0 20px;
            display: inline-block;
        }
        /* Nama */
        .cert-name {
            font-size: 48px;
            font-weight: 800;
            color: #1a56db;
            margin: 15px 0 5px;
            letter-spacing: 2px;
            text-align: center;
            border-bottom: 3px dashed #1a56db;
            padding-bottom: 8px;
            display: inline-block;
        }
        /* Detail Kursus */
        .cert-course {
            font-size: 26px;
            font-weight: 600;
            color: #111827;
            margin: 10px 0 5px;
            text-align: center;
        }
        .cert-description {
            font-size: 16px;
            color: #4b5563;
            text-align: center;
            max-width: 600px;
            line-height: 1.6;
            margin: 8px auto 15px;
        }
        /* Tanggal & Tanda Tangan */
        .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            margin-top: 25px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .cert-footer .left {
            font-size: 14px;
            color: #6b7280;
        }
        .cert-footer .right {
            text-align: right;
            font-size: 14px;
            color: #6b7280;
        }
        .cert-footer .right .signature {
            font-family: 'Brush Script MT', cursive;
            font-size: 28px;
            color: #1a56db;
            margin-bottom: -5px;
        }
        .cert-number {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 10px;
            text-align: center;
            width: 100%;
            border-top: 1px dashed #e5e7eb;
            padding-top: 10px;
        }
        /* Responsive */
        @media (max-width: 700px) {
            .cert-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .cert-title {
                text-align: center;
                margin-top: 10px;
            }
            .cert-name {
                font-size: 32px;
            }
            .cert-course {
                font-size: 20px;
            }
            .cert-footer {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 10px;
            }
            .cert-footer .right {
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate-content">
            <!-- Header dengan Logo -->
            <div class="cert-header">
                <div class="cert-logo">
                    <!-- Ganti src dengan URL logo Anda, atau gunakan teks jika tidak ada -->
                    <img src="https://via.placeholder.com/60x60/1a56db/ffffff?text=DC" alt="Logo Defalima Course" style="border-radius: 12px;">
                    <span class="cert-logo-text">Defalima Course</span>
                </div>
                <div class="cert-title">
                    <h1>Sertifikat</h1>
                    <div class="sub">Kelulusan</div>
                </div>
            </div>

            <!-- Badge -->
            <div class="cert-badge">🎓 Berhasil</div>

            <!-- Nama Penerima -->
            <div class="cert-name">{{ $user->name }}</div>

            <!-- Detail Kursus -->
            <div style="text-align: center; margin-top: 5px;">
                <span style="font-size: 18px; color: #4b5563;">telah menyelesaikan kursus</span>
            </div>
            <div class="cert-course">{{ $course->title }}</div>
            <div class="cert-description">
                dengan hasil memuaskan dan dinyatakan lulus pada tanggal {{ $date }}.
            </div>

            <!-- Footer: Tanggal & Tanda Tangan -->
            <div class="cert-footer">
                <div class="left">
                    <div style="font-weight: 600; color: #1a56db;">Defalima Course</div>
                    <div style="font-size: 12px; color: #9ca3af;">Platform Belajar Online</div>
                </div>
                <div class="right">
                    <div class="signature">Farhan Defra Jaya Kusuma</div>
                    <div style="font-size: 12px; color: #4b5563;">Direktur Defalima Course</div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">{{ $date }}</div>
                </div>
            </div>

            <!-- Nomor Sertifikat -->
            <div class="cert-number">Nomor Sertifikat: {{ $certificate->certificate_number }}</div>
        </div>
    </div>
</body>
</html>
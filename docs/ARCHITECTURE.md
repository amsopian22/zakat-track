# System Architecture - ZakatTrack

Dokumen ini menjelaskan arsitektur teknis dan logika bisnis di balik ZakatTrack.

## 1. High-Level Architecture

ZakatTrack menggunakan pola **Client-Server Architecture**:
- **Frontend**: Single Page Application (SPA) berbasis React yang menangani visualisasi data dan interaksi pengguna.
- **Backend**: RESTful API berbasis FastAPI yang menangani logika bisnis, pengolahan data SAW, dan integrasi AI.
- **Database**: SQLite (Production-ready via SQLAlchemy) untuk penyimpanan data mustahik dan transaksi.
- **AI Layer**: Integrasi dengan Ollama Cloud API untuk pemrosesan bahasa alami.

## 2. Logic Penentuan Prioritas (SAW)

ZakatTrack menggunakan metode **Simple Additive Weighting (SAW)** untuk menentukan mustahik mana yang paling membutuhkan bantuan.

### Kriteria dan Bobot
| Kriteria | Tipe | Bobot | Deskripsi |
|----------|------|-------|-----------|
| C1: Pendapatan | Cost | 0.30 | Semakin kecil pendapatan, skor semakin tinggi |
| C2: Tanggungan | Benefit | 0.25 | Semakin banyak tanggungan, skor semakin tinggi |
| C3: Aset | Cost | 0.15 | Semakin kecil aset, skor semakin tinggi |
| C4: Status Rumah| Cost | 0.10 | 1 (Sewa) lebih tinggi prioritas dibanding 2 (Milik) |
| C5: Pengeluaran | Cost | 0.10 | Beban utilitas bulanan |
| C6: Kesehatan | Benefit | 0.10 | 2 (Sakit) lebih tinggi prioritas dibanding 1 (Sehat) |

### Proses Normalisasi
Setiap kriteria dinormalisasi agar memiliki rentang [0, 1] sebelum dikalikan dengan bobot untuk mendapatkan skor akhir.

## 3. Integrasi AI Advisor

AI Advisor berfungsi untuk menerjemahkan skor numerik menjadi narasi yang manusiawi. 
- **Prompt Engineering**: Data mustahik dialirkan ke model Llama 3.2 dengan instruksi khusus untuk memberikan rekomendasi strategis dalam 3 kalimat.
- **Cloud Infrastructure**: Menggunakan Ollama Cloud untuk memastikan performa tinggi tanpa membebani perangkat lokal.

## 4. Keamanan
- **API Key Authentication**: Melindungi endpoint sensitif (POST, DELETE) menggunakan header `X-API-Key`.
- **Anti-Fraud**: Validasi NIM/NIK unik untuk mencegah duplikasi data mustahik.

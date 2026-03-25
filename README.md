# 🕋 ZakatTrack: Modern Mustahik Analytics & GIS Platform

[![Version](https://img.shields.io/badge/version-1.1-green.svg)](https://github.com/amsopian22/zakat-track)
[![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React-blue.svg)](https://github.com/amsopian22/zakat-track)
[![Focus](https://img.shields.io/badge/focus-SDGs%20%7C%20PIDI%204.0-orange.svg)](https://github.com/amsopian22/zakat-track)

**ZakatTrack** adalah platform *Decision Support System* (DSS) lintas platform yang dirancang untuk merevolusi tata kelola distribusi zakat. Dengan menggabungkan **Analisis Geospatial (GIS)**, **Algoritma SAW Scoring**, dan **Generative AI**, ZakatTrack memastikan setiap rupiah zakat tersalurkan secara presisi, transparan, dan berdampak nyata pada pengentasan kemiskinan (SDGs).

---

## 🚀 Fitur Unggulan (Premium Edition)

### 🧠 Inteligensia Buatan (AI Advisor)
Bukan sekadar data, ZakatTrack memberikan **Insight Strategis**.
- **Async AI Engine**: Integrasi Ollama Cloud (Ministral-3:8b) yang berjalan secara asinkron. Dashboard tetap responsif saat AI menganalisis ribuan data.
- **Floating Chat Widget**: Konsultan AI melayang yang siap memberikan rekomendasi penyaluran hanya dengan satu klik.

### 📶 Ketahanan Lapangan (Offline-First Sync)
Didesain untuk surveyor yang bekerja di daerah minim sinyal.
- **Smart Sync**: Input survey saat offline? Tidak masalah. Data disimpan aman di perangkat dan otomatis terkirim saat internet kembali aktif.
- **Connectivity Guard**: Indikator status koneksi real-time dengan badge antrean data tertunda.

### 📋 Wizard Survey & Automasi
- **Multi-Step Wizard**: Form survey 4-tahap yang intuitif (Identitas, Lokasi, Ekonomi, Sosial).
- **Auto-Rupiah Formatter**: Format mata uang otomatis saat pengisian pendapatan dan aset untuk akurasi data maksimal.
- **GPS Auto-Capture**: Pengambilan koordinat presisi secara otomatis dengan Map Picker interaktif.

### 🛡️ Integritas & Keamanan (Syariah Compliance)
- **Asnaf Guard Rails**: Sistem otomatis memblokir tombol penyaluran untuk kategori "Mampu". Menjaga dana zakat tetap pada jalurnya (Fakir/Miskin).
- **Anti-Fraud NIM**: Validasi unik NIK/NIM untuk mencegah duplikasi data mustahik secara real-time.

### 📄 Laporan Audit Penyaluran
- **Professional PDF Export**: Hasilkan laporan audit distribusi yang rapi, mencakup skor perangkingan dan analisis dampak, siap untuk dilaporkan ke stakeholder.

---

## 🏗️ Arsitektur & Pipeline Data

ZakatTrack menggunakan arsitektur modern berbasis mikroservis asinkron untuk menangani beban analitik yang berat tanpa mengorbankan pengalaman pengguna.

```mermaid
sequenceDiagram
    participant S as Surveyor (React)
    participant G as FastAPI Gateway
    participant D as DB (SQLite/Async)
    participant A as AI Scorer (SAW)
    participant O as Ollama AI (Async)

    S->>G: Post Mustahik Data
    G->>A: Calculate Priority Score
    A-->>G: Returned Score (0-100)
    G->>D: Save with Asnaf & Score
    G-->>S: Response 201 (Created)
    
    Note over G,O: Background Task (Async)
    G->>O: Request AI Insight
    O-->>G: JSON Insight
    G->>D: Cache Insight
```

### Stack Teknologi
- **Frontend**: React.js, Vite, Leaflet (Map), Lucide Icons, Glassmorphism UI.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy (Async), Pydantic v2.
- **AI**: Ollama Cloud API (Model: `ministral-3:8b`).
- **Algorithm**: Simple Additive Weighting (SAW) untuk Multi-Criteria Decision Making.

---

## 🛠️ Instalasi & Konfigurasi

### 1. Kloning Repositori
```bash
git clone https://github.com/amsopian22/zakat-track.git
cd zakat-track
```

### 2. Persiapan Backend
```bash
# Buat virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux

# Instal dependensi
pip install -r requirements.txt

# Buat file .env dan isi API Key Anda
cp .env.example .env
```

### 3. Persiapan Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Logika Matematika & Algoritma

### 1. Klasifikasi Asnaf (Economic Threshold)
Sistem menggunakan ambang batas Garis Kemiskinan (GK) spesifik daerah untuk menentukan kategori mustahik secara otomatis:

$$Income_{pc} = \frac{Income_{total}}{Dependents}$$

Kategorisasi mengikuti formula:
- **Fakir**: $Income_{pc} < 0.5 \times GK$
- **Miskin**: $0.5 \times GK \leq Income_{pc} < GK$
- **Mampu**: $Income_{pc} \geq GK$

### 2. Algoritma Simple Additive Weighting (SAW)
Perangkingan prioritas penyaluran dihitung menggunakan normalisasi matriks keputusan ($R$) dan bobot kriteria ($W$):

#### A. Normalisasi Matriks ($r_{ij}$)
- **Kriteria Keuntungan (Benefit)**: $r_{ij} = \frac{x_{ij}}{max(x_i)}$
- **Kriteria Biaya (Cost)**: $r_{ij} = \frac{min(x_i)}{x_{ij}}$

#### B. Perhitungan Skor Akhir ($V_i$)
$$V_i = \sum_{j=1}^{n} w_j r_{ij}$$

**Matriks Kriteria:**
| Kriteria | Deskripsi | Tipe | Bobot ($w$) |
| :--- | :--- | :--- | :--- |
| **C1** | Pendapatan | Cost | 0.30 |
| **C2** | Tanggungan | Benefit | 0.25 |
| **C3** | Aset | Cost | 0.15 |
| **C4** | Status Rumah | Cost | 0.10 |
| **C5** | Pengeluaran | Cost | 0.10 |
| **C6** | Kesehatan | Benefit | 0.10 |

---

## 🌍 Kontribusi SDGs
ZakatTrack secara otomatis melabeli setiap bantuan untuk mendukung:
- **SDG 1: Tanpa Kemiskinan**
- **SDG 2: Tanpa Kelaparan**

---

## 🤝 Kontribusi
Kami menerima kontribusi untuk pengembangan lebih lanjut. Silakan buat *Pull Request* atau laporkan *issue* jika ditemukan bug.

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---
---
### 💰 Ekosistem Penyaluran (Donation API)
Endpoint baru untuk mengelola transparansi dana:
- `POST /api/v1/donation`: Mencatat dana masuk dari Muzakki.
- `POST /api/v1/donation/disburse`: Menyalurkan dana ke Mustahik + Auto SDG tagging.
- `GET /api/v1/donations`: Riwayat transaksi lengkap.

## 📝 Update Terbaru (25 Maret 2026)

### ⚙️ Status Operasional
- **Backend (FastAPI)**: Telah diverifikasi berjalan di port 8000 menggunakan lingkungan `agentic_ai`.
- **Frontend (Vite)**: Dikonfigurasi untuk port 5173 dengan host `0.0.0.0` untuk aksesibilitas yang lebih luas.
- **Verifikasi Logika**: Logika penginputan donasi dan survey telah disinkronkan untuk mendukung alur kerja *offline-first*.

### 🚀 Deployment
- Sinkronisasi otomatis ke GitHub untuk integrasi CI/CD yang lebih baik.

---
*Dikembangkan oleh Antigravity AI @ PIDI 4.0 Ecosystem.*

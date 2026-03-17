# ZakatTrack - Digital Mustahik Mapping & SAW Scoring

ZakatTrack adalah platform modern untuk manajemen distribusi zakat yang menggabungkan analisis spasial (Mapping), algoritma pengambilan keputusan (SAW Scoring), dan kecerdasan buatan (AI Advisor) untuk memastikan penyaluran yang presisi, transparan, dan berdampak sosial (SDGs).

## ✨ Fitur Utama
- **Interactive Geospatial Dashboard**: Pemetaan lokasi mustahik secara real-time menggunakan Mapbox/Leaflet.
- **SAW (Simple Additive Weighting) Scoring**: Perangkingan otomatis berdasarkan 13 variabel kemiskinan (Pendapatan, Tanggungan, Aset, dll).
- **AI Advisor (Ollama Cloud)**: Analis AI yang memberikan narasi strategis berdasarkan data mustahik secara instan.
- **Multi-step Survey Wizard**: Antarmuka survei modern yang memudahkan petugas di lapangan dengan format mata uang otomatis dan pemilihan drop-down.
- **Asnaf Guard Rails**: Sistem keamanan yang menjaga dana zakat hanya disalurkan kepada yang berhak (Fakir/Miskin), memblokir kategori "Mampu".
- **Impact Tracking**: Visualisasi kontribusi penyaluran zakat terhadap pilar-pilar SDGs (SDG 1 & SDG 2).

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, Ollama Cloud API.
- **Frontend**: React.js, Vite, Leaflet, Lucide-React.
- **Database**: SQLite (Development) / PostgreSQL (Production).
- **Logic**: Simple Additive Weighting (SAW) Algorithm.

## 🚀 Memulai (Quick Start)

### Prasyarat
- Python 3.9+
- Node.js & npm
- Akun Ollama Cloud (untuk AI Advisor)

### Instalasi Backend
1. Masuk ke folder root.
2. Instal dependensi:
   ```bash
   pip install -r requirements.txt
   ```
3. Konfigurasi `.env`:
   ```env
   ZAKATTRACK_API_KEY=your_secret_key
   OLLAMA_API_KEY=your_ollama_cloud_key
   OLLAMA_MODEL=ministral-3:8b
   GK_SAMARINDA=720000
   ```
4. Jalankan server:
   ```bash
   uvicorn ai_engine.main:app --reload
   ```

### Instalasi Frontend
1. Masuk ke folder `frontend`.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```

## 🔒 Keamanan
- **API Security**: Semua endpoint mutasi data dilindungi dengan `X-API-Key` header.
- **Anti-Fraud**: Validasi NIM/NIK unik untuk mencegah duplikasi data mustahik.
- **Eligibility Guard**: Logic sistem mencegah penyaluran kepada kategori non-asnaf.

## 📄 Dokumentasi Tambahan
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)

---
*Dikembangkan dengan standar premium oleh Antigravity AI.*

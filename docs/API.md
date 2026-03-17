# API Documentation - ZakatTrack v1.1

Semua request harus menyertakan header `Content-Type: application/json`. Endpoint tulis (POST/DELETE) memerlukan API Key.

## Base URL
`http://127.0.0.1:8000`

## Endpoints

### 1. Rekapitulasi & Scoring
**`GET /api/v1/mustahiks`**
- **Deskripsi**: Mengambil daftar semua mustahik, lengkap dengan skor prioritas SAW yang sudah dihitung.
- **Output**: Array of objects sorted by `priority_score` (descending).

### 2. Manajemen Mustahik
**`POST /api/v1/mustahik`**
- **Header**: `X-API-Key: <your_key>`
- **Body**: 
```json
{
  "name": "Budi Santoso",
  "nik": "1234567890123456",
  "income": 1200000,
  "dependents": 4,
  "assets": 5000000,
  "house_status": 1,
  "utility_exp": 150000,
  "health_status": 1
}
```

**`DELETE /api/v1/mustahik/{id}`**
- **Header**: `X-API-Key: <your_key>`
- **Deskripsi**: Menghapus data mustahik.

### 3. AI Insights
**`GET /api/v1/ai/insight`**
- **Deskripsi**: Menghasilkan analisis AI berdasarkan data mustahik teratas saat ini.

### 4. Tracking & Donasi
**`GET /api/v1/donation/qrcode/{donation_id}`**
- **Deskripsi**: Menghasilkan QR Code untuk pelacakan donasi.

**`GET /api/v1/track/{donation_id}`**
- **Deskripsi**: Mengambil status penyaluran donasi spesifik.

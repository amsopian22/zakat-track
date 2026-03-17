# **PRODUCT REQUIREMENT DOCUMENT (PRD) & CANVAS**

**Nama Produk:** Zakat Track | **Tipe:** Decision Support System (DSS) & GIS Platform

**Versi:** 1.1 (MVP Enhancement \- PIDI 4.0 Edition) | **Fokus:** Pengayaan Data, QRIS, SDGs, & PIDI 4.0 Showcase

## **1\. PRODUCT LEAN CANVAS (Ringkasan Eksekutif V1.1)**

*Kanvas ini disesuaikan dengan dokumen proposal, menyoroti integrasi QRIS, matriks SDGs, dan 5 Pilar PIDI 4.0.*

| 1\. PROBLEM (Masalah) | 2\. SOLUTION (Solusi) | 3\. UNIQUE VALUE PROPOSITION (Nilai Unik) | 4\. UNFAIR ADVANTAGE (Keunggulan Utama) | 5\. CUSTOMER SEGMENTS (Target Pengguna) |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Subjektivitas Verifikasi:** Penentuan manual rentan bias. **2\. Ketidakakuratan Data:** Data LAZ tidak sinkron dengan data makro BPS. **3\. Kesenjangan Transparansi:** Donatur tidak bisa melacak dampak. **4\. Efisiensi Rendah:** Klasifikasi 8 asnaf makan waktu lama. | **1\. AI Scoring & Auto-Asnaf:** Penilaian SAW & Naive Bayes. **2\. BPS API Integration:** Standar Had Kifayah (Ambang Batas) dinamis. **3\. QRIS & SDG Tracking:** Penyaluran instan & pelabelan program ke target SDGs. **4\. GIS Heatmap:** Peta kemiskinan *real-time*. | Platform terpadu (*one-stop*) yang mengawinkan kelayakan algoritmis (BPS & AI), transparansi donasi (QR/QRIS), dan tata kelola global (Kodifikasi SDGs BAZNAS). | Dukungan inkubasi langsung dari ekosistem **PIDI 4.0** (Ecosystem & Showcase Center) serta integrasi API BPS STADATA yang eksklusif. | **1\. B2B:** Lembaga Amil Zakat (LAZ), BAZNAS (Khususnya area Kaltim). **2\. B2G:** Dinas Sosial / Pemkot Samarinda. **3\. B2C:** Donatur Publik (Muzakki). |
| **6\. COST STRUCTURE (Struktur Biaya)** |  |  |  | **7\. REVENUE STREAMS (Aliran Pendapatan)** |
| \- Infrastruktur Cloud & Database Spasial. \- MDR (Merchant Discount Rate) QRIS/Payment Gateway. \- Biaya pemeliharaan API. |  |  |  | \- **SaaS B2B:** Biaya langganan bulanan platform. \- **White-label Setup:** Implementasi *Command Center* untuk Pemda/BAZNAS besar. |

## **2\. ARSITEKTUR SISTEM & ALUR DATA (UPDATE V1.1)**

Alur kerja diperbarui sesuai Deskripsi Solusi (Bagian 3\) pada dokumen proposal Anda.

### **Alur Pemrosesan Utama (The Zakat Track Pipeline):**

1. **Input & Validasi:** Petugas menginput data via aplikasi seluler. Sistem memvalidasi Nomor Identifikasi Mustahik (NIM) untuk mencegah duplikasi (Anti-Fraud).  
2. **Benchmark BPS Otomatis:** Sistem menarik data Garis Kemiskinan (GK) dan P0, P1, P2 dari WebAPI BPS berdasarkan koordinat input.  
3. **Scoring Engine (0-100):** Mesin menghitung skor (SAW) & mengklasifikasi 8 golongan asnaf (Naive Bayes) secara otomatis. Program bantuan dilabeli dengan **Matriks SDGs** (misal: SDG 1 \- *No Poverty*, SDG 2 \- *Zero Hunger*).  
4. **Penyaluran Digital (QRIS):** Admin memvalidasi dan menginstruksikan penyaluran dana via sistem pembayaran digital (Transfer Bank/QRIS).  
5. **Auto-Update QR Donatur:** Status QR Code donatur otomatis berubah menjadi "Tersalurkan" lengkap dengan peta GIS *Showcase* sebagai bukti transparansi.

## **3\. SPESIFIKASI FITUR UTAMA (PENGEMBANGAN MVP)**

Tambahan fitur berdasarkan dokumen proposal (Strategi PIDI 4.0, QRIS, & SDGs).

| Modul Utama | Nama Fitur | Spesifikasi Teknis & Logika | Prioritas |
| :---- | :---- | :---- | :---- |
| **Mobile Client** | *Surveyor App (NIM Validator)* | Form 13 kriteria dinamis dengan deteksi otomatis duplikasi Nomor Identifikasi Mustahik (NIM). | P1 |
| **API Gateway** | *BPS STADATA Sync* | Sinkronisasi Had Kifayah (Rata-rata Rp 4.502.669/bulan di Kaltim) dengan indikator makro BPS. | P1 |
| **AI Engine** | *SAW & Asnaf Classifier* | Algoritma *scoring* yang dioptimalkan dengan akurasi target \> 91,25% (Sesuai dokumen referensi). | P1 |
| **Digital Payment** | *QRIS Disbursement Gateway* | **\[FITUR BARU\]** Integrasi *Payment Gateway* untuk menerima donasi (In) dan penyaluran langsung ke rekening/dompet digital mustahik (Out). | P1 |
| **Analytics** | *SDGs Matrix Coder* | **\[FITUR BARU\]** Pelabelan otomatis program penyaluran zakat terhadap 17 tujuan SDGs, merujuk pada Panduan BAZNAS. | P2 |
| **Web Dashboard** | *PIDI 4.0 Showcase Mode* | **\[FITUR BARU\]** UI khusus dasbor (Dark Mode, Animasi Peta *Heatmap* interaktif) yang didesain untuk dipajang di *Showcase Center* PIDI 4.0 dan *Command Center* BAZNAS. | P2 |
| **Public Portal** | *Auto-Update QR Tracker* | Kode QR donatur yang memperbarui status pelacakan secara *real-time* setelah admin mengeksekusi penyaluran QRIS. | P2 |

## **4\. METRIK KEBERHASILAN (KPI)**

Sesuai dengan Bagian 6 dari dokumen proposal Anda, MVP ini harus mencapai KPI berikut selama masa *Pilot Project* di Samarinda:

| Indikator Keberhasilan | Target | Metrik Pengukuran (Verifikasi Sistem) |
| :---- | :---- | :---- |
| **Akurasi Distribusi** | **\> 90%** | Kesesuaian hasil *scoring* AI dengan audit/observasi manual lapangan. |
| **Transparansi Donatur** | **100%** | Persentase donasi masuk yang sukses di- *generate* menjadi QR pelacakan hingga ke tangan mustahik. |
| **Efisiensi Waktu** | **\- 60%** | Reduksi durasi (*timestamps* di database) dari input data (Surveyor App) hingga klik penyaluran (QRIS Gateway). |
| **User Adoption** | **\> 1.000 user** | Total Amil, Manajer LAZ, dan Donatur yang berinteraksi dengan platform (Login/Scan QR). |

## **5\. KEBUTUHAN NON-FUNGSIONAL & KEAMANAN**

* **Standar Keamanan QRIS/Fintech:** Sistem harus menggunakan protokol enkripsi kelas perbankan dan API otentikasi (OAuth 2.0 / HMAC) untuk setiap *request* penyaluran dana agar terhindar dari *fraud*.  
* **Database Relasional & Spasial:** PostgreSQL (Data Transaksi & Mustahik) \+ PostGIS (Koordinat *Heatmap*).  
* **Ekosistem PIDI 4.0:** Infrastruktur diusulkan untuk di-*host* atau diintegrasikan secara komputasi melalui *AI & Engineering Center* PIDI 4.0 untuk memfasilitasi *Machine Learning training*.

## **6\. ROADMAP PENGEMBANGAN V1.1 (5 BULAN HACKATHON)**

* **Bulan 1:** Riset Indikator Kemiskinan Kaltim, Desain UI/UX *Showcase Mode*, Setup Database PostGIS.  
* **Bulan 2:** Integrasi WebAPI BPS STADATA (Had Kifayah) & Pengembangan modul CRUD Mustahik dengan validasi NIM.  
* **Bulan 3:** Koding *AI Scoring Engine* (SAW & Naive Bayes) di lingkungan *AI Center* PIDI 4.0. Target akurasi 91,25%.  
* **Bulan 4:** Integrasi **QRIS Payment Gateway** dan Pengembangan *Auto-Update QR Tracker*.  
* **Bulan 5:** Pilot Project di Wilayah Samarinda. Pengujian untuk mencapai KPI (Efisiensi 60%, Akurasi \>90%), dan finalisasi *Showcase Center* Display.
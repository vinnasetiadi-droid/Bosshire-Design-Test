# 🚀 Handoff Context — Bosshire Design Test (Untuk Dilanjutkan di Laptop Lain)

> **Cara Pakai di Laptop Baru:**
> 1. Buka folder `Bosshire Design Test` ini sebagai **Workspace** di Antigravity pada laptop barumu.
> 2. Ketik di chat Antigravity:
>    *"Baca file `HANDOFF_CONTEXT.md`, `BRIEF.md`, dan `BRAINSTORMING.md` untuk memahami semua konteks project kita, lalu jalankan local server."*

---

## 1. Ringkasan Project & File yang Sudah Dibuat
Project ini adalah **AI Product Design Challenge** untuk **Bosshire** (merancang pengalaman *mobile AI-powered job portal* dalam **5–7 layar utama**, bukan sekadar chatbot).

### Daftar File di Folder Ini:
- **`BRIEF.md`**: Seluruh persyaratan, aturan utama, dan bobot penilaian dari PDF soal tes desain.
- **`BRAINSTORMING.md`** & **`brainstorm-board.html`**: Jawaban lengkap untuk **Core Requirement 1 (Problem & Product Thinking — 6 poin wajib)** dan **Core Requirement 2 (AI & Human Collaboration — 4 poin wajib)** serta peta alur **6 layar utama** dalam bentuk papan visual ala FigJam.
- **`design-system.html`** & **`tokens.css`**: Full **Bosshire Design System (Light Mode Only)** yang diadaptasi 100% dari `LnD Design System (Option A)` milik user:
  - Font: `DM Sans` (hanya weight `400` dan `500`, tanpa bold berlebihan) + `Geist Mono` (`tabular-nums`) untuk semua angka/persentase.
  - Warna Brand Bosshire:
    - **Primary ("boss" Steel Navy):** `#44658B` (Strong/Hover: `#355070`, Sky: `#B0CFEE`, Soft Tint: `#F4F8FC`, Surface 50: `#EBF2FA`).
    - **Attention / AI Signal ("hire" Warm Amber):** `#F79626` / `#F8A12A` (Text: `#B54708`, Surface: `#FFFAEB`).
  - Aturan Bentuk Option A:
    - **White cards on a soft page:** Card putih rata (`#FFFFFF`), sudut `18px`, tanpa border & tanpa shadow saat diam di atas latar halaman `#F5F6F8`, dipisahkan jarak `12px`.
    - **Concentric Radius Ladder:** `24px` (Dialog) → `18px` (Card) → `14px` (Frame dalam card / AIInsightLine) → `10px` (Inner item).
    - **Controls = Full Pill (`999px`):** Semua tombol (`PillButton` `40px` dalam 5 varian flat: Primary, Tint, Secondary, Ghost, Danger), `SearchField` (`40px`), `FilterChip` (`40px`), `Segmented Control Tabs` (`40px` & `32px`), dan `Chip` (`30px` tinggi, teks `12px`) berbentuk full pill **tanpa gradient pada tombol**.
  - Mencakup 100% **Charts** (`lnd-ds-01-charts.html`), **Background & Effect Tokens** (`lnd-ds-03-background.html`), dan **245 Hugeicons (`stroke 1.5`)** (`lnd-ds-icons.html` & `icons.js`).
- **`bosshire-logo.png`**: Logo resmi Bosshire.
- **`bosshire-ai-blob.png`**: Gambar **Bosshire AI Blob (Orange + Blue)** (`600×600` transparent PNG) hasil adaptasi dari NISA Orb untuk penanda visual AI Bosshire.
- **`index.html`**, **`styles.css`**, **`app.js`**, **`icons.js`**: Wadah **Mobile Vibecode Workbench** (`393 × 852 px` iOS / `360 × 800 px` Android) lengkap dengan:
  - Switcher **Screen 1 sampai 6**
  - Switcher **Critical States** (`Default`, `Loading / AI Processing`, `Low Confidence / Missing Data`, `Empty State`, `Error / User Override`, `Success State`)
  - Toggle **Single Phone View**, **Canvas View (All 6 Screens Side-by-Side)**, **Brainstorm Board**, dan **Design System**.

---

## 2. Konsep Produk yang Sudah Disepakati (Gabungan Opsi 1 + Opsi 2)
- **Tema Utama:** **Bosshire "Global Remote Reality Check & Reachout Decision Hub"** untuk talenta digital Indonesia.
- **Latar Belakang Masalah:** Pekerja tech/desainer di Indonesia sudah lelah macet 2–3 jam/hari ke SCBD/Kuningan dan mengincar kerja *Global Remote* ke perusahaan Inggris (UK), Australia, US, atau Singapura (termasuk pengalaman nyata user di-*reachout* oleh recruiter British). Namun mereka bingung oleh 4 hal:
  1. Jebakan *"Remote Palsu"* (ternyata wajib warga/visa UK/US, bukan bisa kerja dari Indonesia).
  2. Ketakutan jam kerja terbalik di waktu WIB (`UTC+7`) apakah harus begadang tiap malam atau cukup *overlap* 3 jam sore.
  3. Bingung menghitung gaji valuta asing (`£` / `AUD` / `USD`) bersih dalam Rupiah dibanding gaji kantor SCBD (dikurangi ongkos & 60 jam macet/bulan).
  4. Banyak istilah kontrak luar negeri yang membingungkan dan informasi yang masih abu-abu di pesan awal recruiter.

---

## 3. Langkah Selanjutnya (Next Step Saat Dibuka di Laptop Baru)
Mulai **vibecode isi detail ke-6 layar utama** di dalam `app.js` menggunakan komponen **Bosshire Design System (Option A)**:
1. **Screen 1 (`01 · Problem`):** Explore Global Roles & Recruiter Reachout Hub (kartu *reachout* dari Recruiter British + daftar lowongan Aussie/UK ramah WNI).
2. **Screen 2 (`02 · AI Interaction`):** AI Reality Check — Bedah Tawaran British (`£3,200/bln`) vs Ngantor SCBD (Kamus Kontrak Tanpa Jargon + Chart Jam Kerja WIB + Chart Gaji Bersih vs Hemat 60 Jam Macet).
3. **Screen 3 (`03 · User Decision`):** Kalibrasi Batas Nyaman Hidup WIB (atur batas jam malam maksimal & override biaya transport/asuransi).
4. **Screen 4 (`04 · Uncertainty`):** Deteksi Info Abu-Abu (`64% Confidence` Amber Frame — recruiter British belum sebut durasi wajib meeting malam).
5. **Screen 5 (`05 · Action`):** Smart Reply & Pertanyaan Klarifikasi ke Recruiter British (bukan chatbot, melainkan kartu penyusun poin balasan profesional).
6. **Screen 6 (`06 · Outcome`):** Global Opportunity Decision Tracker (perbandingan peluang London UK vs Sydney Aussie vs Kantor SCBD).

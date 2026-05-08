# AGENTS.md — Synectra

> Dokumen ini adalah panduan resmi untuk semua agen (AI maupun manusia) yang bekerja dalam project **Synectra**. Setiap kontributor **wajib** membaca dan mengikuti seluruh aturan yang tertulis di sini sebelum melakukan perubahan apapun pada codebase.

---

## 📌 Project Overview

| Field            | Detail                                      |
|------------------|---------------------------------------------|
| **Project Name** | Synectra                                    |
| **Purpose**      | Platform untuk kebutuhan penerimaan client  |
| **Architecture** | MC (Model - Controller)                     |
| **Backend**      | Next.js API Routes + Supabase               |
| **Auth**         | Google OAuth 2.0 + JWT Token                |
| **API Docs**     | Swagger (OpenAPI 3.0)                       |

---

## 🛠️ Tech Stack

### Backend
- **Next.js** — Framework utama, digunakan untuk API Routes (`/app/api` atau `/pages/api`)
- **Supabase** — Database (PostgreSQL), Storage, dan Realtime
- **Google Auth** — Autentikasi via OAuth 2.0 menggunakan Google provider
- **JWT Token** — Mekanisme otorisasi setelah login; token digenerate dan divalidasi di setiap protected route
- **Swagger (OpenAPI 3.0)** — Dokumentasi API otomatis; setiap endpoint baru **wajib** didokumentasikan

---

## 📁 Project Structure (MC)

```
synectra/
│
├── app/                        # Next.js App Router (entry point)
│   └── api/                    # API Routes — hanya memanggil controller
│       ├── auth/               # Endpoint autentikasi (login, logout, callback Google)
│       ├── clients/            # Endpoint manajemen client
│       └── [...]/              # Endpoint domain lainnya
│
├── controllers/                # Logic handler untuk setiap domain
│   ├── authController.ts       # Mengelola alur autentikasi & JWT
│   ├── clientController.ts     # Mengelola logika penerimaan & manajemen client
│   └── [...]/                  # Controller domain lainnya
│
├── models/                     # Definisi data & interaksi database (Supabase)
│   ├── userModel.ts            # Schema & query untuk tabel users
│   ├── clientModel.ts          # Schema & query untuk tabel clients
│   └── [...]/                  # Model domain lainnya
│
├── lib/                        # Utility & konfigurasi inti
│   ├── supabaseClient.ts       # Inisialisasi & konfigurasi Supabase client
│   ├── jwtHelper.ts            # Generate, verify, dan decode JWT token
│   ├── googleAuth.ts           # Konfigurasi Google OAuth provider
│   └── swagger.ts              # Setup dan konfigurasi Swagger/OpenAPI
│
├── middlewares/                # Middleware global
│   ├── authMiddleware.ts       # Validasi JWT token pada protected routes
│   └── errorMiddleware.ts      # Global error handler
│
├── types/                      # TypeScript type & interface definitions
│   ├── auth.types.ts           # Type untuk payload auth & JWT
│   ├── client.types.ts         # Type untuk data client
│   └── api.types.ts            # Type untuk request & response API
│
├── constants/                  # Nilai konstan & konfigurasi statis
│   └── index.ts                # Semua konstanta (status code, pesan error, dll)
│
├── docs/                       # Dokumentasi project
│   └── swagger.yaml            # File OpenAPI spec (auto-generated atau manual)
│
├── .env.local                  # Environment variables (JANGAN di-commit)
├── .env.example                # Template environment variables (wajib diupdate)
├── AGENTS.md                   # Dokumen panduan ini
└── README.md                   # Deskripsi project & cara menjalankan
```

---

## 🧱 Aturan MC — Tanggung Jawab Setiap Layer

| Layer          | Lokasi          | Tanggung Jawab                                                                            |
|----------------|-----------------|-------------------------------------------------------------------------------------------|
| **Model**      | `/models/`      | Semua interaksi dengan Supabase (SELECT, INSERT, UPDATE, DELETE). Tidak ada logic bisnis. |
| **Controller** | `/controllers/` | Menerima input, memproses logic bisnis, memanggil model, mengembalikan response JSON.     |
| **API Route**  | `/app/api/`     | Entry point HTTP. Hanya memanggil controller — tidak boleh ada logic bisnis di sini.      |

---

## ✅ Aturan Clean Code

### Penamaan
- Gunakan **camelCase** untuk variabel dan fungsi: `getUserById`, `clientData`
- Gunakan **PascalCase** untuk Class: `AuthController`, `ClientModel`
- Gunakan **SCREAMING_SNAKE_CASE** untuk konstanta: `MAX_TOKEN_EXPIRY`, `API_BASE_URL`
- Nama harus **deskriptif dan bermakna** — hindari nama seperti `data`, `temp`, `x`, `foo`

### Fungsi
- Satu fungsi = **satu tanggung jawab** (Single Responsibility Principle)
- Panjang fungsi **tidak boleh lebih dari 40 baris** — jika lebih, pecah menjadi sub-fungsi
- Selalu gunakan **return type** yang eksplisit pada fungsi TypeScript
- Hindari **nested callback** lebih dari 2 level — gunakan `async/await`

### Komentar
- Tulis komentar untuk menjelaskan **MENGAPA**, bukan **APA** yang dilakukan kode
- Gunakan JSDoc untuk dokumentasi fungsi publik:
  ```ts
  /**
   * Memvalidasi JWT token dan mengembalikan payload user
   * @param token - JWT string dari Authorization header
   * @returns UserPayload jika valid, null jika tidak valid
   */
  export function verifyToken(token: string): UserPayload | null { ... }
  ```
- Hapus komentar yang sudah tidak relevan atau kode yang di-comment out

### Import & Dependency
- Urutkan import: **built-in → external → internal** (dipisahkan baris kosong)
- Hindari **circular dependency** antar module
- Jangan import seluruh library jika hanya butuh satu fungsi

### Error Handling
- Selalu gunakan `try/catch` pada operasi async yang berpotensi gagal
- Kembalikan response error yang **konsisten** menggunakan format berikut:
  ```json
  {
    "success": false,
    "message": "Deskripsi error yang jelas",
    "code": "ERROR_CODE"
  }
  ```
- Jangan pernah expose stack trace atau pesan error internal ke client (production)

### TypeScript
- **Dilarang** menggunakan tipe `any` — gunakan `unknown` atau definisikan type yang tepat
- Setiap request dan response API **wajib** memiliki interface/type tersendiri di `/types/`
- Aktifkan `strict: true` di `tsconfig.json`

---

## 🔐 Aturan Autentikasi & Keamanan

- **JWT Token** wajib divalidasi di `authMiddleware.ts` untuk setiap protected route
- Token **tidak boleh** disimpan di `localStorage` — gunakan `httpOnly cookie`
- **Google OAuth callback** hanya boleh diproses di `/api/auth/callback`
- Semua environment variable sensitif (Supabase key, JWT secret, Google client secret) **wajib** disimpan di `.env.local` dan tidak boleh hardcode di kode
- File `.env.local` **dilarang keras** di-commit ke repository

---

## 📄 Aturan Dokumentasi API (Swagger)

- Setiap endpoint baru yang dibuat **wajib** didokumentasikan di Swagger sebelum PR dibuat
- Gunakan JSDoc annotation atau update `docs/swagger.yaml` secara manual
- Format response **harus konsisten** antara dokumentasi dan implementasi aktual
- Swagger UI dapat diakses di `/api/docs` (development only)

---

## 🚦 Hal yang BOLEH Dilakukan ✅

- ✅ Membuat endpoint baru dengan struktur MC yang benar
- ✅ Menambahkan type/interface baru di `/types/`
- ✅ Melakukan refactor kode selama tidak mengubah behavior yang sudah ada
- ✅ Menambahkan konstanta baru di `/constants/`
- ✅ Mengupdate dokumentasi Swagger setiap ada perubahan endpoint
- ✅ Menggunakan Supabase RLS (Row Level Security) untuk mengamankan data
- ✅ Menambahkan error handling yang lebih spesifik
- ✅ Mengoptimasi query Supabase yang lambat

---

## 🚫 Hal yang TIDAK BOLEH Dilakukan ❌

- ❌ **DILARANG** menulis logic bisnis langsung di API Route (`/app/api/`) — taruh di Controller
- ❌ **DILARANG** menulis query database langsung di Controller — taruh di Model
- ❌ **DILARANG** menggunakan tipe `any` di TypeScript
- ❌ **DILARANG** hardcode credential, API key, atau secret di dalam kode
- ❌ **DILARANG** commit file `.env.local` atau file sensitif lainnya
- ❌ **DILARANG** menonaktifkan ESLint rule tanpa persetujuan project leader
- ❌ **DILARANG** membuat file testing (unit test, integration test, e2e test)
- ❌ **DILARANG** melakukan push langsung ke branch `main` atau `production`
- ❌ **DILARANG** merge PR tanpa review dari project leader
- ❌ **DILARANG** menghapus atau mengubah dokumentasi Swagger yang sudah ada tanpa alasan
- ❌ **DILARANG** menggunakan `console.log` di production build — gunakan logger yang proper

---

## 🔄 Alur Kerja Git — WAJIB DIIKUTI

> Setiap perubahan, sekecil apapun, **wajib** di-push ke repository.

### Branching Strategy

```
main          → Branch production (DILARANG push langsung)
develop       → Branch utama pengembangan
feature/*     → Branch untuk fitur baru     (contoh: feature/client-onboarding)
fix/*         → Branch untuk perbaikan bug  (contoh: fix/jwt-expiry-issue)
hotfix/*      → Branch untuk perbaikan kritis di production
```

### Alur Setiap Perubahan

```bash
# 1. Selalu mulai dari develop yang terbaru
git checkout develop
git pull origin develop

# 2. Buat branch baru sesuai jenis perubahan
git checkout -b feature/nama-fitur

# 3. Lakukan perubahan, kemudian stage semua file
git add .

# 4. Commit dengan pesan yang deskriptif
git commit -m "feat: tambah endpoint POST /api/clients dengan validasi JWT"

# 5. Push ke remote SEGERA setelah commit
git push origin feature/nama-fitur

# 6. Buat Pull Request ke branch develop
# 7. Tunggu review dari project leader sebelum merge
```

### Format Pesan Commit (Conventional Commits)

| Prefix     | Digunakan Untuk                                      |
|------------|------------------------------------------------------|
| `feat:`    | Fitur baru                                           |
| `fix:`     | Perbaikan bug                                        |
| `refactor:`| Perubahan kode tanpa mengubah behavior               |
| `docs:`    | Perubahan dokumentasi (termasuk Swagger & AGENTS.md) |
| `style:`   | Perubahan formatting, tidak mengubah logika          |
| `chore:`   | Update dependency, konfigurasi, dsb                  |

**Contoh pesan commit yang baik:**
```
feat: tambah Google OAuth callback handler di authController
fix: perbaiki validasi JWT token yang expired tidak ditangani
docs: update Swagger spec untuk endpoint GET /api/clients
refactor: pisahkan logic validasi client ke helper function
```

---

## ⚙️ Environment Variables yang Diperlukan

Buat file `.env.local` berdasarkan template `.env.example` berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 👤 Project Leader

Semua keputusan arsitektur, perubahan breaking change, dan merge ke `main` harus melalui persetujuan **Project Leader**.

Jika ada pertanyaan atau ketidakjelasan terkait panduan ini, **tanyakan dulu sebelum mengimplementasikan**.

---

*Dokumen ini dikelola oleh Project Leader Synectra. Setiap perubahan pada AGENTS.md harus melalui review dan di-push dengan commit message `docs: update AGENTS.md`.*
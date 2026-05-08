# AGENTS.md — Synectra

> Dokumen ini adalah panduan resmi untuk semua agen (AI maupun manusia) yang bekerja dalam project **Synectra**. Setiap kontributor **wajib** membaca dan mengikuti seluruh aturan yang tertulis di sini sebelum melakukan perubahan apapun pada codebase.

---

## 📌 Project Overview

| Field            | Detail                                      |
|------------------|---------------------------------------------|
| **Project Name** | Synectra                                    |
| **Purpose**      | Platform untuk kebutuhan penerimaan client  |
| **Architecture** | MC (Model - Controller)                     |
| **Framework**    | NestJS                                      |
| **Database**     | Supabase (PostgreSQL)                       |
| **Auth**         | Google OAuth 2.0 + JWT Token                |
| **API Docs**     | Swagger (OpenAPI 3.0)                       |

---

## 🛠️ Tech Stack

- **NestJS** — Framework utama backend berbasis Node.js; menggunakan module system, decorator, dan dependency injection bawaan
- **Supabase** — Database PostgreSQL managed; diakses via Supabase JS Client atau langsung lewat `pg`
- **Google Auth** — Autentikasi via OAuth 2.0 menggunakan Passport.js strategy (`passport-google-oauth20`)
- **JWT Token** — Otorisasi setelah login menggunakan `@nestjs/jwt` dan `passport-jwt`; divalidasi via Guard
- **Swagger (OpenAPI 3.0)** — Dokumentasi API otomatis menggunakan `@nestjs/swagger`; setiap endpoint **wajib** didokumentasikan dengan decorator

---

## 📁 Project Structure (MC)

```
synectra/
│
├── src/
│   │
│   ├── main.ts                             # Entry point aplikasi; setup Swagger & global pipe
│   ├── app.module.ts                       # Root module; import semua feature module
│   │
│   ├── config/                             # Konfigurasi aplikasi
│   │   ├── supabase.config.ts              # Konfigurasi koneksi Supabase
│   │   ├── jwt.config.ts                   # Konfigurasi secret & expiry JWT
│   │   └── google-auth.config.ts           # Konfigurasi Google OAuth credentials
│   │
│   ├── modules/                            # Feature modules (satu folder per domain)
│   │   │
│   │   ├── auth/                           # Module autentikasi
│   │   │   ├── auth.module.ts              # Deklarasi module auth
│   │   │   ├── auth.controller.ts          # Controller: handle endpoint /auth/*
│   │   │   ├── auth.service.ts             # Service: logic autentikasi & generate JWT
│   │   │   ├── strategies/
│   │   │   │   ├── google.strategy.ts      # Passport strategy untuk Google OAuth
│   │   │   │   └── jwt.strategy.ts         # Passport strategy untuk validasi JWT
│   │   │   └── dto/
│   │   │       └── auth-response.dto.ts
│   │   │
│   │   ├── clients/                        # Module manajemen client
│   │   │   ├── clients.module.ts           # Deklarasi module clients
│   │   │   ├── clients.controller.ts       # Controller: handle endpoint /clients/*
│   │   │   ├── clients.service.ts          # Service: logic bisnis client
│   │   │   └── dto/
│   │   │       ├── create-client.dto.ts
│   │   │       └── update-client.dto.ts
│   │   │
│   │   └── [...]/                          # Module domain lainnya (struktur sama)
│   │
│   ├── models/                             # Definisi data & interaksi database (Supabase)
│   │   ├── user.model.ts                   # Query & schema untuk tabel users
│   │   ├── client.model.ts                 # Query & schema untuk tabel clients
│   │   └── [...]/                          # Model domain lainnya
│   │
│   ├── common/                             # Shared utilities lintas module
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts           # Guard validasi JWT untuk protected route
│   │   │   └── google-auth.guard.ts        # Guard trigger Google OAuth flow
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts   # Decorator untuk ambil user dari request
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts    # Global exception filter (format error konsisten)
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts     # Format standar semua response sukses
│   │   └── pipes/
│   │       └── validation.pipe.ts          # Global ValidationPipe dengan class-validator
│   │
│   ├── types/                              # TypeScript type & interface definitions
│   │   ├── auth.types.ts                   # Type untuk payload JWT & Google profile
│   │   ├── client.types.ts                 # Type untuk data client
│   │   └── api.types.ts                    # Type untuk standar request & response API
│   │
│   └── constants/                          # Nilai konstan & konfigurasi statis
│       └── index.ts                        # Status code, pesan error, nama tabel Supabase
│
├── .env                                    # Environment variables (JANGAN di-commit)
├── .env.example                            # Template environment variables (wajib diupdate)
├── AGENTS.md                               # Dokumen panduan ini
└── README.md                               # Deskripsi project & cara menjalankan
```

---

## 🧱 Aturan MC — Tanggung Jawab Setiap Layer

| Layer          | Lokasi                        | Tanggung Jawab                                                                                |
|----------------|-------------------------------|-----------------------------------------------------------------------------------------------|
| **Controller** | `modules/*/**.controller.ts`  | Menerima HTTP request, memanggil Service, mengembalikan response. **Tidak ada logic bisnis.** |
| **Service**    | `modules/*/**.service.ts`     | Memproses seluruh logic bisnis dan memanggil Model. Inti dari layer Controller.               |
| **Model**      | `models/`                     | Semua interaksi langsung dengan Supabase (SELECT, INSERT, UPDATE, DELETE).                    |
| **DTO**        | `modules/*/dto/`              | Validasi dan typing shape data request body. Gunakan `class-validator`.                       |
| **Guard**      | `common/guards/`              | Proteksi route: validasi JWT atau inisiasi OAuth flow. Tidak ada logic bisnis.                |

> **Catatan:** Service adalah bagian dari layer Controller dalam arsitektur MC project ini. Controller mendelegasikan semua pekerjaan ke Service, dan Service memanggil Model untuk akses data.

---

## ✅ Aturan Clean Code

### Penamaan
- Gunakan **camelCase** untuk variabel dan fungsi: `getUserById`, `createClient`
- Gunakan **PascalCase** untuk Class dan DTO: `AuthService`, `CreateClientDto`
- Gunakan **SCREAMING_SNAKE_CASE** untuk konstanta: `JWT_EXPIRES_IN`, `SUPABASE_TABLE_CLIENTS`
- Nama file menggunakan **kebab-case**: `auth.controller.ts`, `create-client.dto.ts`
- Nama harus **deskriptif dan bermakna** — hindari nama seperti `data`, `temp`, `x`, `res2`

### Fungsi & Method
- Satu fungsi = **satu tanggung jawab** (Single Responsibility Principle)
- Panjang fungsi **tidak boleh lebih dari 40 baris** — jika lebih, pecah menjadi sub-fungsi
- Selalu gunakan **return type** eksplisit pada setiap method TypeScript
- Gunakan `async/await` — hindari `.then().catch()` yang bersarang

### Decorator & Swagger
- Setiap endpoint di Controller **wajib** menggunakan decorator Swagger:
  ```ts
  @ApiOperation({ summary: 'Deskripsi singkat endpoint' })
  @ApiResponse({ status: 200, description: 'Berhasil', type: ClientResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  ```
- Setiap DTO **wajib** menggunakan `@ApiProperty()` untuk mendokumentasikan setiap field

### DTO & Validasi
- Semua input dari request body **wajib** menggunakan DTO dengan `class-validator`:
  ```ts
  export class CreateClientDto {
    @ApiProperty({ example: 'PT Maju Bersama' })
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @ApiProperty({ example: 'client@example.com' })
    @IsEmail()
    email: string;
  }
  ```
- **Dilarang** memproses `req.body` mentah di Controller tanpa melalui DTO

### Komentar
- Tulis komentar untuk menjelaskan **MENGAPA**, bukan **APA** yang dilakukan kode
- Gunakan JSDoc untuk dokumentasi method publik di Service dan Model:
  ```ts
  /**
   * Membuat record client baru di Supabase
   * @param dto - Data client yang sudah divalidasi
   * @returns Client yang baru dibuat beserta id-nya
   */
  async createClient(dto: CreateClientDto): Promise<Client> { ... }
  ```
- Hapus komentar tidak relevan dan kode yang di-comment out

### Import & Dependency
- Urutkan import: **NestJS core → third-party → internal** (dipisahkan baris kosong)
- Hindari **circular dependency** antar module — gunakan `forwardRef()` hanya jika benar-benar diperlukan
- Daftarkan provider hanya di module yang memilikinya, ekspor jika dibutuhkan module lain

### Error Handling
- Gunakan **NestJS built-in exceptions** — jangan throw `Error` biasa:
  ```ts
  throw new UnauthorizedException('Token tidak valid atau sudah expired');
  throw new NotFoundException(`Client dengan id ${id} tidak ditemukan`);
  throw new BadRequestException('Email sudah terdaftar');
  ```
- `HttpExceptionFilter` di `common/filters/` akan memformat semua error ke response konsisten:
  ```json
  {
    "success": false,
    "statusCode": 401,
    "message": "Token tidak valid atau sudah expired",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
  ```
- Jangan pernah expose stack trace ke client di environment production

### TypeScript
- **Dilarang** menggunakan tipe `any` — gunakan `unknown` atau definisikan type/interface yang tepat
- Semua shape data API **wajib** punya DTO atau type di `/types/`
- Aktifkan `strict: true` di `tsconfig.json`

---

## 🔐 Aturan Autentikasi & Keamanan

- Semua protected route **wajib** menggunakan `@UseGuards(JwtAuthGuard)`
- JWT disimpan di **httpOnly cookie** — tidak boleh dikirim atau disimpan di `localStorage`
- **Google OAuth callback** hanya boleh diproses di endpoint `/auth/google/callback`
- Semua environment variable sensitif **wajib** ada di `.env` — tidak boleh hardcode di kode
- File `.env` **dilarang keras** di-commit ke repository
- Gunakan `ConfigService` dari `@nestjs/config` untuk membaca env variable — **jangan** gunakan `process.env` langsung di luar file config

---

## 📄 Aturan Dokumentasi API (Swagger)

- Swagger UI dapat diakses di `/api/docs` (development only — dimatikan di production)
- Setup Swagger berada di `src/main.ts`
- Setiap **Controller baru** wajib menggunakan `@ApiTags('nama-module')`
- Setiap **endpoint baru** wajib memiliki `@ApiOperation`, `@ApiResponse` sukses, dan `@ApiResponse` untuk error
- Setiap **DTO baru** wajib memiliki `@ApiProperty()` di semua field-nya
- Dokumentasi harus **sinkron** dengan implementasi aktual setiap saat

---

## 🚦 Hal yang BOLEH Dilakukan ✅

- ✅ Membuat module baru dengan struktur MC yang benar (module, controller, service, dto)
- ✅ Menambahkan DTO baru di folder `dto/` dalam module yang relevan
- ✅ Menambahkan type/interface baru di `/types/`
- ✅ Menambahkan Guard, Interceptor, atau Pipe baru di `/common/`
- ✅ Melakukan refactor selama tidak mengubah behavior yang sudah ada
- ✅ Menambahkan konstanta baru di `/constants/`
- ✅ Mengupdate dokumentasi Swagger setiap ada perubahan endpoint
- ✅ Menggunakan Supabase RLS (Row Level Security) untuk mengamankan data
- ✅ Mengoptimasi query Supabase yang lambat

---

## 🚫 Hal yang TIDAK BOLEH Dilakukan ❌

- ❌ **DILARANG** menulis logic bisnis di Controller — taruh di Service
- ❌ **DILARANG** menulis query database langsung di Controller atau Service — taruh di Model
- ❌ **DILARANG** memproses `req.body` mentah tanpa DTO dan validasi
- ❌ **DILARANG** menggunakan tipe `any` di TypeScript
- ❌ **DILARANG** hardcode credential, secret, atau API key di dalam kode
- ❌ **DILARANG** membaca env variable dengan `process.env` langsung — gunakan `ConfigService`
- ❌ **DILARANG** commit file `.env` atau file sensitif lainnya
- ❌ **DILARANG** menonaktifkan `ValidationPipe` atau ESLint rule tanpa persetujuan project leader
- ❌ **DILARANG** membuat file testing (unit test, integration test, e2e test)
- ❌ **DILARANG** melakukan push langsung ke branch `main` atau `production`
- ❌ **DILARANG** merge PR tanpa review dari project leader
- ❌ **DILARANG** menambah atau mengubah endpoint tanpa update Swagger
- ❌ **DILARANG** menggunakan `console.log` — gunakan `Logger` dari `@nestjs/common`

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
git commit -m "feat: tambah module clients dengan endpoint POST /clients"

# 5. Push ke remote SEGERA setelah commit
git push origin feature/nama-fitur

# 6. Buat Pull Request ke branch develop
# 7. Tunggu review dari project leader sebelum merge
```

### Format Pesan Commit (Conventional Commits)

| Prefix      | Digunakan Untuk                                      |
|-------------|------------------------------------------------------|
| `feat:`     | Fitur baru                                           |
| `fix:`      | Perbaikan bug                                        |
| `refactor:` | Perubahan kode tanpa mengubah behavior               |
| `docs:`     | Perubahan dokumentasi (termasuk Swagger & AGENTS.md) |
| `style:`    | Perubahan formatting, tidak mengubah logika          |
| `chore:`    | Update dependency, konfigurasi, dsb                  |

**Contoh pesan commit yang baik:**
```
feat: tambah Google OAuth strategy di auth module
fix: perbaiki JWT guard yang tidak menolak token expired
docs: tambah Swagger decorator di clients controller
refactor: pindahkan logic validasi email ke auth service
chore: update @nestjs/swagger ke versi terbaru
```

---

## ⚙️ Environment Variables yang Diperlukan

Buat file `.env` berdasarkan template `.env.example` berikut:

```env
# App
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 👤 Project Leader

Semua keputusan arsitektur, perubahan breaking change, dan merge ke `main` harus melalui persetujuan **Project Leader**.

Jika ada pertanyaan atau ketidakjelasan terkait panduan ini, **tanyakan dulu sebelum mengimplementasikan**.

---

*Dokumen ini dikelola oleh Project Leader Synectra. Setiap perubahan pada AGENTS.md harus melalui review dan di-push dengan commit message `docs: update AGENTS.md`.*
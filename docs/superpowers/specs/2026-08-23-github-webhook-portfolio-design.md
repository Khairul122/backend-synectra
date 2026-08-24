# GitHub Org Webhook → Auto-Publish Repo Baru ke Portfolio

## Tujuan
Repo baru (atau repo lama yang ditandai belakangan) di GitHub Organization
otomatis muncul sebagai entry di tabel `portofolio` Supabase — tanpa isi
form admin manual — supaya tampil di section Portfolio landing page.

## Alur
1. GitHub Org webhook (event **Repository**) terpasang sekali di GitHub
   Settings → Webhooks. Otomatis mencakup semua repo di org, termasuk yang
   dibuat setelah webhook dipasang.
2. GitHub POST ke `POST /api/webhooks/github` setiap ada perubahan level-repo
   (`created`, `edited`, `publicized`, dll).
3. Backend verifikasi `X-Hub-Signature-256` (HMAC-SHA256 dari raw body,
   secret di `GITHUB_WEBHOOK_SECRET`). Signature invalid → 401, request
   ditolak.
4. Filter kelayakan: `repository.private === false` DAN
   `repository.topics` memuat topic `GITHUB_PORTFOLIO_TOPIC` (default:
   `portfolio`). Repo yang tidak lolos → di-skip, response tetap 200 (biar
   GitHub tidak retry sia-sia).
5. Repo yang lolos di-**upsert** (bukan insert biasa) ke `portofolio`
   berdasarkan `github_repo_id` — supaya event `created` lalu `edited`
   (topic ditambah belakangan) untuk repo yang sama tidak menghasilkan
   duplikat, dan perubahan description di GitHub ikut ter-sync.

## Kenapa event `created`, `edited`, DAN `publicized` semua ditangani
Topic repo biasanya ditambahkan lewat halaman Settings **setelah** repo
dibuat (GitHub tidak menyediakan cara set topic saat create), jadi filter
"public + topic" sering baru terpenuhi saat event `edited` (perubahan
topics) atau `publicized` (repo privat dijadikan publik) — bukan cuma
`created`. Actions lain (`deleted`, `archived`, `privatized`, dst) sengaja
tidak ditangani di v1: tidak ada auto-hapus dari portfolio, tetap manual
lewat admin panel yang sudah ada.

## Keamanan: raw body untuk signature
Signature GitHub dihitung dari byte asli request body. Kalau body sudah
diparse ulang jadi objek JS lalu di-stringify lagi, hasilnya bisa beda
whitespace dari body asli → signature selalu gagal cocok. Solusinya:
`server.use('/api/webhooks/github', express.raw({ type: 'application/json' }))`
didaftarkan di `main.ts` **sebelum** body-parser JSON global milik Nest —
route lain tidak terpengaruh, cuma route ini yang menerima `req.body`
sebagai `Buffer` mentah.

## Perubahan skema (migration `add_github_repo_fields_to_portofolio`)
```sql
alter table public.portofolio
  add column github_repo_id bigint unique,
  add column repo_url text;
```

## Field mapping
| Kolom `portofolio` | Sumber |
|---|---|
| `title` | `repository.name` |
| `description` | `repository.description` (null kalau kosong) |
| `repo_url` | `repository.html_url` |
| `github_repo_id` | `repository.id` |
| `image`, `category` | dikosongkan — diisi manual lewat admin panel Portfolio yang sudah ada (tidak ada sumber gambar dari GitHub; frontend sudah fallback ke icon placeholder kalau `image` kosong) |

## File yang dibuat/diubah
- `src/config/github.config.ts` — env `GITHUB_WEBHOOK_SECRET`, `GITHUB_PORTFOLIO_TOPIC`
- `src/common/utils/github-signature.ts` — verifikasi HMAC, timing-safe compare
- `src/types/github-webhook.types.ts` — tipe payload (cuma field yang dipakai)
- `src/modules/webhooks/github-webhook.{controller,service,module}.ts`
- `src/models/portfolio.model.ts` — tambah `upsertFromGithubRepo`
- `src/types/portfolio.types.ts` — tambah `repoUrl`, `githubRepoId`
- `src/app.module.ts`, `src/main.ts` — registrasi module & raw-body middleware

## Scope yang sengaja tidak dibuat (YAGNI)
- Tidak ada auto-unpublish/delete saat topic dicabut atau repo dihapus.
- Tidak menangani event `push` — cuma event level-repo.
- Tidak memvalidasi seluruh skema payload GitHub via DTO/class-validator —
  payload pihak ketiga yang sudah diautentikasi lewat HMAC signature, bukan
  input user biasa; divalidasi lewat tipe TypeScript sempit yang cuma
  mendeklarasikan field yang benar-benar dibaca.

## Setup GitHub (manual, di luar kode)
1. Generate secret acak (mis. `openssl rand -hex 32`), simpan sebagai
   `GITHUB_WEBHOOK_SECRET` di Vercel env vars.
2. GitHub → Organization Settings → Webhooks → Add webhook:
   - Payload URL: `https://backend-synectra-murex.vercel.app/api/webhooks/github`
   - Content type: `application/json`
   - Secret: sama seperti langkah 1
   - Events: centang **"Let me select individual events"** → **Repositories** saja
3. Set env var `GITHUB_PORTFOLIO_TOPIC` di Vercel kalau mau nama topic
   selain `portfolio` (opsional, default sudah `portfolio`).
4. Repo yang mau tampil di landing page: pastikan **public** + tambah topic
   `portfolio` di halaman repo (About → gear icon → Topics).

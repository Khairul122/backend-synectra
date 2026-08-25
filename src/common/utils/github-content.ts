// Pakai Contents API (api.github.com), BUKAN raw.githubusercontent.com — raw.*
// itu di-serve lewat CDN Fastly dengan Cache-Control: max-age=300 (5 menit).
// Kalau di-fetch segera setelah push (webhook fire near-instant), CDN bisa masih
// kasih isi file versi SEBELUM push. Contents API baca langsung dari GitHub,
// tidak kena cache basi itu. `ref` sebaiknya commit sha spesifik (payload.after
// pada push event) supaya tidak ambigu, bukan sekadar nama branch.
export async function fetchGithubRawFile(
  fullName: string,
  ref: string,
  path: string,
): Promise<Buffer | null> {
  const url = `https://api.github.com/repos/${fullName}/contents/${path}?ref=${ref}`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github.raw' } });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

const COVER_IMAGE_CANDIDATES = ['cover.png', 'cover.jpg', 'cover.jpeg', 'cover.webp'];

export async function fetchGithubCoverImage(
  fullName: string,
  ref: string,
): Promise<{ buffer: Buffer; filename: string } | null> {
  for (const filename of COVER_IMAGE_CANDIDATES) {
    const buffer = await fetchGithubRawFile(fullName, ref, filename);
    if (buffer) return { buffer, filename };
  }
  return null;
}

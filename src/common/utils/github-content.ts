// GitHub tidak expose isi file lewat webhook payload — file opsional (cover
// image, deskripsi.md, kategori.md) dicek langsung ke raw.githubusercontent.com
// per event. Repo target selalu public (syarat eligibility di webhook service),
// jadi tidak butuh token. 404/response gagal dianggap "file tidak ada", bukan error.
export async function fetchGithubRawFile(
  fullName: string,
  branch: string,
  path: string,
): Promise<Buffer | null> {
  const url = `https://raw.githubusercontent.com/${fullName}/${branch}/${path}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

const COVER_IMAGE_CANDIDATES = ['cover.png', 'cover.jpg', 'cover.jpeg', 'cover.webp'];

export async function fetchGithubCoverImage(
  fullName: string,
  branch: string,
): Promise<{ buffer: Buffer; filename: string } | null> {
  for (const filename of COVER_IMAGE_CANDIDATES) {
    const buffer = await fetchGithubRawFile(fullName, branch, filename);
    if (buffer) return { buffer, filename };
  }
  return null;
}

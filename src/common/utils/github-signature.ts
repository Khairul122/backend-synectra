import { createHmac, timingSafeEqual } from 'crypto';

// GitHub menandatangani body webhook dengan HMAC-SHA256 dari secret yang kita
// set saat konfigurasi webhook. payload HARUS berupa raw bytes asli request,
// bukan hasil JSON.stringify ulang — reserialize bisa beda whitespace dan
// bikin signature selalu tidak cocok.
export function verifyGithubSignature(
  payload: Buffer,
  signatureHeader: string | undefined,
  secret: string,
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const expected =
    'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(signatureHeader, 'utf8');

  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

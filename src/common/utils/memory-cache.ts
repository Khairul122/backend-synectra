const store = new Map<string, { value: unknown; expiresAt: number }>();

// Cache sederhana in-memory dengan TTL, untuk mengurangi query berulang ke Supabase
// pada endpoint publik (landing page) yang datanya jarang berubah.
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const entry = store.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.value as T;
  }
  const value = await fn();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

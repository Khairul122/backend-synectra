// Hanya field yang benar-benar kita pakai — payload asli GitHub jauh lebih besar
// (organization, sender, permissions, dll) dan bisa berubah sewaktu-waktu.
export interface GithubRepositoryWebhookPayload {
  // Nilai lain di luar daftar HANDLED_ACTIONS milik service juga sah (mis. "deleted",
  // "archived") — dibiarkan `string` biasa karena kita hanya cek keanggotaan lewat Set, bukan narrowing.
  action: string;
  repository: {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    private: boolean;
    topics?: string[];
  };
  changes?: {
    topics?: { from: string[] };
  };
}

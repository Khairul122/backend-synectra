import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const FONNTE_URL = 'https://fontee.io/api/send';

const STATUS_LABELS: Record<string, string> = {
  pending:     'Menunggu Konfirmasi ⏳',
  in_progress: 'Sedang Dikerjakan ✍️',
  testing:     'Siap untuk Review 🔍',
  revision:    'Dalam Proses Revisi 🔄',
  completed:   'Selesai ✅',
  canceled:    'Dibatalkan ❌',
};

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly token: string;
  private readonly adminPhone: string;

  constructor(private readonly configService: ConfigService) {
    this.token      = this.configService.get<string>('FONNTE_TOKEN')      ?? '';
    this.adminPhone = this.configService.get<string>('ADMIN_WA_NUMBER')   ?? '';
  }

  async send(phone: string, message: string): Promise<void> {
    if (!this.token || !phone) return;
    try {
      const body = new URLSearchParams({ target: phone, message });
      const res = await fetch(FONNTE_URL, {
        method:  'POST',
        headers: { token: this.token },
        body,
      });
      if (!res.ok) {
        this.logger.warn(`WA gagal ke ${phone}: HTTP ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`WA error ke ${phone}: ${err}`);
    }
  }

  /** Notifikasi admin saat ada order baru masuk */
  notifyAdminNewOrder(order: {
    title:           string;
    clientName?:     string | null;
    clientEmail?:    string | null;
    phone?:          string | null;
    serviceCategory?: string | null;
  }): void {
    if (!this.adminPhone) return;
    const msg = [
      `🛒 *Order Baru Masuk — Synectra*`,
      ``,
      `👤 Client : ${order.clientName ?? order.clientEmail ?? 'Tidak diketahui'}`,
      `📋 Judul  : ${order.title}`,
      order.serviceCategory ? `📁 Kategori: ${order.serviceCategory.replace(/_/g, ' ')}` : null,
      order.phone           ? `📱 No. WA  : ${order.phone}` : null,
      ``,
      `Segera tinjau di panel admin Synectra.`,
    ].filter(l => l !== null).join('\n');

    this.send(this.adminPhone, msg).catch(() => {});
  }

  /** Notifikasi client saat status order berubah */
  notifyClientStatusChange(phone: string, order: { title: string; status: string }): void {
    const label = STATUS_LABELS[order.status] ?? order.status;
    const msg = [
      `📋 *Update Status Order — Synectra*`,
      ``,
      `Halo! Status order kamu telah diperbarui.`,
      ``,
      `📌 Judul  : ${order.title}`,
      `🔄 Status : ${label}`,
      ``,
      order.status === 'in_progress' ? `Kami segera mengerjakan pesanan kamu. Stay tuned! 🚀` :
      order.status === 'testing'     ? `Pesanan siap untuk kamu review. Silakan cek di aplikasi.` :
      order.status === 'completed'   ? `Terima kasih telah menggunakan layanan Synectra! 🙏` :
      order.status === 'canceled'    ? `Hubungi kami jika ada pertanyaan.` :
      `Pantau perkembangan di aplikasi Synectra.`,
    ].join('\n');

    this.send(phone, msg).catch(() => {});
  }

  /** Notifikasi client saat pembayaran terverifikasi */
  notifyClientPaymentVerified(phone: string, data: { title: string; amount: number }): void {
    const msg = [
      `✅ *Pembayaran Terverifikasi — Synectra*`,
      ``,
      `Pembayaran sebesar *Rp ${data.amount.toLocaleString('id-ID')}* untuk order *${data.title}* telah kami terima dan verifikasi.`,
      ``,
      `Pekerjaan akan segera dilanjutkan. Terima kasih! 🙏`,
    ].join('\n');

    this.send(phone, msg).catch(() => {});
  }

  /** Notifikasi client saat pembayaran ditolak */
  notifyClientPaymentRejected(phone: string, data: { title: string; notes: string }): void {
    const msg = [
      `❌ *Pembayaran Ditolak — Synectra*`,
      ``,
      `Pembayaran untuk order *${data.title}* tidak dapat kami verifikasi.`,
      `📝 Alasan: ${data.notes}`,
      ``,
      `Mohon upload ulang bukti transfer yang sesuai melalui aplikasi.`,
    ].join('\n');

    this.send(phone, msg).catch(() => {});
  }
}

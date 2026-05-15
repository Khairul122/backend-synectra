import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactChannelModel } from '../../models/contact-channel.model';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private gmailUser: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly contactChannelModel: ContactChannelModel,
  ) {
    const user = this.configService.get<string>('GMAIL_USER');
    const pass = this.configService.get<string>('GMAIL_APP_PASSWORD');
    if (user && pass) {
      this.gmailUser = user;
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
  }

  private get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') ?? 'https://synectra-pi.vercel.app';
  }

  private readonly CSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #F5F0E8; padding: 24px; }
    .wrap { max-width: 560px; margin: 0 auto; }
    .header { padding: 20px 28px; border: 2px solid #0D0D0D; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .header-title { font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .header-sub { font-size: 11px; margin-top: 4px; font-family: monospace; }
    .header-logo { height: 52px; width: auto; max-width: 110px; object-fit: contain; background: #ffffff; border: 2px solid rgba(255,255,255,0.4); padding: 6px 8px; flex-shrink: 0; }
    .body { background: #ffffff; border: 2px solid #0D0D0D; border-top: none; padding: 28px; }
    .badge { display: inline-block; font-size: 10px; font-weight: 800; font-family: monospace; text-transform: uppercase; padding: 4px 10px; border: 2px solid #0D0D0D; margin-bottom: 20px; }
    .field { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F0EBE3; }
    .field:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-size: 10px; font-family: monospace; text-transform: uppercase; color: rgba(13,13,13,0.5); letter-spacing: 1px; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 700; color: #0D0D0D; }
    .sub { font-size: 13px; color: rgba(13,13,13,0.6); line-height: 1.6; margin-top: 4px; }
    .cta { display: block; margin-top: 24px; padding: 14px 20px; border: 2px solid #0D0D0D; font-weight: 800; font-size: 13px; text-decoration: none; text-align: center; text-transform: uppercase; letter-spacing: 1px; box-shadow: 4px 4px 0 #0D0D0D; }
    .footer { background: #0D0D0D; border: 2px solid #0D0D0D; border-top: none; padding: 14px 28px; }
    .footer p { color: rgba(255,255,255,0.3); font-size: 11px; font-family: monospace; }
  `;

  private html(headerColor: string, headerTextColor: string, badgeColor: string, badgeTextColor: string,
    title: string, subtitle: string, fields: string, ctaHref: string, ctaLabel: string, ctaColor: string, ctaTextColor: string): string {
    return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>${this.CSS}</style></head>
<body><div class="wrap">
  <div class="header" style="background:${headerColor}">
    <div class="header-inner">
      <div>
        <div class="header-title" style="color:${headerTextColor}">${title}</div>
        <div class="header-sub" style="color:${headerTextColor}99">Synectra · Notification</div>
      </div>
      <img src="https://synectra-pi.vercel.app/logo-synectra.jpeg" alt="Synectra" class="header-logo" />
    </div>
  </div>
  <div class="body">
    <span class="badge" style="background:${badgeColor};color:${badgeTextColor}">${subtitle}</span>
    ${fields}
    <a href="${ctaHref}" class="cta" style="background:${ctaColor};color:${ctaTextColor}">${ctaLabel}</a>
  </div>
  <div class="footer"><p>Email otomatis dari sistem Synectra · Jangan balas email ini</p></div>
</div></body></html>`;
  }

  private field(label: string, value: string, sub?: string): string {
    return `<div class="field"><div class="label">${label}</div><div class="value">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
  }

  /** Ambil email admin dari contact management, fallback ke ADMIN_EMAIL env */
  private async getAdminEmail(): Promise<string | null> {
    try {
      const emails = await this.contactChannelModel.findEmailContacts();
      if (emails.length > 0) return emails[0];
    } catch { /* fallback */ }
    return this.configService.get<string>('ADMIN_EMAIL') ?? null;
  }

  async sendNewOrderNotification(order: {
    id: string;
    title: string;
    serviceCategory: string | null;
    description: string | null;
    clientName: string | null;
    clientEmail: string | null;
  }): Promise<void> {
    if (!this.transporter) { this.logger.warn('RESEND_API_KEY belum dikonfigurasi.'); return; }
    const adminEmail = await this.getAdminEmail();
    if (!adminEmail) { this.logger.warn('Email admin tidak ditemukan di contact management maupun env.'); return; }

    const category    = order.serviceCategory?.replace(/_/g, ' ') ?? 'Tidak ditentukan';
    const description = order.description ? order.description.replace(/<[^>]*>/g, ' ').trim().slice(0, 400) : 'Tidak ada deskripsi.';
    const desc        = order.description && order.description.replace(/<[^>]*>/g, '').length > 400 ? description + '...' : description;

    const fields = [
      this.field('Judul Pesanan', order.title),
      this.field('Kategori Layanan', category),
      this.field('Client', order.clientName ?? '—', order.clientEmail ?? undefined),
      this.field('Detail Kebutuhan', '', desc),
    ].join('');

    const html = this.html('#0D0D0D', '#FFD000', '#FFD000', '#0D0D0D',
      '⚡ Pesanan Baru Masuk', 'New Order', fields,
      `${this.frontendUrl}/orders/${order.id}`, 'Lihat & Kelola Pesanan →', '#FFD000', '#0D0D0D');

    try {
      await this.transporter.sendMail({ from: `Synectra <${this.gmailUser}>`, to: adminEmail, subject: `[Synectra] Pesanan Baru: ${order.title}`, html });
      this.logger.log(`Email order baru dikirim ke ${adminEmail}`);
    } catch (err) { this.logger.error('Gagal kirim email order baru ke admin', err); }
  }

  async sendNewOrderToClient(clientEmail: string, data: {
    orderId:          string;
    title:            string;
    clientName?:      string | null;
    serviceCategory?: string | null;
    description?:     string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const greeting = data.clientName ? `Halo, ${data.clientName}!` : 'Halo!';
    const desc = data.description ? data.description.replace(/<[^>]*>/g, ' ').trim().slice(0, 300) : null;
    const fields = [
      this.field('Halo', greeting),
      this.field('Pesanan', data.title),
      data.serviceCategory ? this.field('Kategori Layanan', data.serviceCategory.replace(/_/g, ' ')) : '',
      desc ? this.field('Deskripsi Kebutuhan', '', desc) : '',
      this.field('Status', 'Menunggu Konfirmasi', 'Tim kami akan segera meninjau pesanan kamu dan menghubungi untuk detail lebih lanjut.'),
    ].join('');
    const html = this.html('#FFD000', '#0D0D0D', '#0D0D0D', '#FFD000',
      '✅ Pesanan Berhasil Dikirim', 'Order Diterima', fields,
      `${this.frontendUrl}/my-orders/${data.orderId}`, 'Pantau Pesanan →', '#0D0D0D', '#FFD000');
    try {
      await this.transporter.sendMail({ from: `Synectra <${this.gmailUser}>`, to: clientEmail, subject: `[Synectra] Pesanan Kamu Berhasil Dikirim!`, html });
    } catch (err) { this.logger.error('Gagal kirim email konfirmasi order ke client', err); }
  }

  async sendRevisionToAdmin(data: {
    orderId:     string;
    title:       string;
    items:       Array<{ notes: string }>;
    clientName?: string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const adminEmail = await this.getAdminEmail();
    if (!adminEmail) return;
    const revisionPoints = data.items.map((item, i) =>
      this.field(`Poin Revisi ${i + 1}`, item.notes),
    ).join('');
    const fields = [
      this.field('Pesanan', data.title),
      this.field('Dari Client', data.clientName ?? '—'),
      this.field('Total Poin Revisi', String(data.items.length), 'Detail setiap poin revisi:'),
      revisionPoints,
    ].join('');
    const html = this.html('#F97316', '#ffffff', '#F97316', '#ffffff',
      '🔄 Permintaan Revisi Masuk', 'Revisi Client', fields,
      `${this.frontendUrl}/orders/${data.orderId}`, 'Lihat Detail Revisi →', '#F97316', '#ffffff');
    try {
      await this.transporter.sendMail({ from: `Synectra <${this.gmailUser}>`, to: adminEmail, subject: `[Synectra] Revisi Diminta: ${data.title}`, html });
    } catch (err) { this.logger.error('Gagal kirim email revisi ke admin', err); }
  }

  async sendProgressUpdateToClient(clientEmail: string, data: {
    orderId:            string;
    orderTitle:         string;
    progressTitle:      string;
    progressPercentage: number;
    isLocked:           boolean;
    clientName?:        string | null;
    description?:       string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const greeting   = data.clientName ? `Halo, ${data.clientName}!` : 'Halo!';
    const detailInfo = data.isLocked ? '🔒 Detail progress terkunci — akan terbuka setelah pembayaran diverifikasi.' : 'Klik tombol di bawah untuk melihat detail lengkap.';
    const fields = [
      this.field('Halo', greeting),
      this.field('Pesanan', data.orderTitle),
      this.field('Update Progress', data.isLocked ? '🔒 ' + data.progressTitle : data.progressTitle),
      this.field('Persentase', `${data.progressPercentage}%`, detailInfo),
      (!data.isLocked && data.description) ? this.field('Detail Progress', '', data.description) : '',
    ].join('');
    const html = this.html('#4D61FF', '#ffffff', '#4D61FF', '#ffffff',
      '📊 Ada Update Progress Baru', 'Progress Update', fields,
      `${this.frontendUrl}/my-orders/${data.orderId}`, 'Lihat Progress →', '#4D61FF', '#ffffff');
    try {
      await this.transporter.sendMail({ from: `Synectra <${this.gmailUser}>`, to: clientEmail, subject: `[Synectra] Progress Update: ${data.progressTitle}`, html });
    } catch (err) { this.logger.error('Gagal kirim email progress ke client', err); }
  }

  async sendPaymentSubmittedToAdmin(data: {
    orderId:        string;
    orderTitle:     string;
    amount:         number;
    paymentType:    string;
    clientName?:    string | null;
    paymentNumber?: string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const adminEmail = await this.getAdminEmail();
    if (!adminEmail) return;
    const typeLabel: Record<string, string> = { dp: 'Down Payment (DP)', termin_1: 'Termin', pelunasan: 'Pelunasan' };
    const fields = [
      this.field('Pesanan', data.orderTitle),
      this.field('Dari Client', data.clientName ?? '—'),
      this.field('Tipe Pembayaran', typeLabel[data.paymentType] ?? data.paymentType),
      this.field('Jumlah', `Rp ${data.amount.toLocaleString('id-ID')}`),
      data.paymentNumber ? this.field('No. Referensi Transfer', data.paymentNumber) : '',
      this.field('Tindakan', 'Menunggu Verifikasi', 'Segera verifikasi bukti transfer di panel admin.'),
    ].join('');
    const html = this.html('#0D0D0D', '#FFD000', '#FFD000', '#0D0D0D',
      '💰 Pembayaran Baru Masuk', 'Menunggu Verifikasi', fields,
      `${this.frontendUrl}/orders/${data.orderId}`, 'Verifikasi Pembayaran →', '#FFD000', '#0D0D0D');
    try {
      await this.transporter.sendMail({ from: `Synectra <${this.gmailUser}>`, to: adminEmail, subject: `[Synectra] Pembayaran Baru Menunggu Verifikasi`, html });
    } catch (err) { this.logger.error('Gagal kirim email pembayaran ke admin', err); }
  }

  async sendOrderStatusUpdate(clientEmail: string, data: {
    orderId:     string;
    title:       string;
    status:      string;
    clientName?: string | null;
    deadline?:   string | null;
  }): Promise<void> {
    if (!this.transporter) return;

    const STATUS_META: Record<string, { label: string; color: string; textColor: string; message: string }> = {
      pending:     { label: 'Menunggu Konfirmasi', color: '#FFD000', textColor: '#0D0D0D', message: 'Pesanan kamu sedang menunggu konfirmasi dari tim kami.' },
      in_progress: { label: 'Sedang Dikerjakan',   color: '#4D61FF', textColor: '#ffffff', message: 'Tim kami sudah mulai mengerjakan pesanan kamu. Kami akan memberikan update progress secara berkala.' },
      testing:     { label: 'Siap untuk Review',   color: '#A855F7', textColor: '#ffffff', message: 'Pekerjaan sudah selesai dan siap untuk kamu review. Silakan cek hasilnya.' },
      revision:    { label: 'Dalam Proses Revisi', color: '#F97316', textColor: '#ffffff', message: 'Permintaan revisi kamu sedang diproses. Kami akan segera menyelesaikannya.' },
      completed:   { label: 'Selesai! ✓',          color: '#00C48C', textColor: '#ffffff', message: 'Pesanan kamu telah selesai dikerjakan. Terima kasih telah menggunakan layanan Synectra!' },
      canceled:    { label: 'Dibatalkan',           color: '#FF5C5C', textColor: '#ffffff', message: 'Pesanan ini telah dibatalkan. Hubungi kami jika ada pertanyaan.' },
    };

    const meta    = STATUS_META[data.status] ?? { label: data.status, color: '#0D0D0D', textColor: '#ffffff', message: '' };
    const greeting = data.clientName ? `Halo, ${data.clientName}!` : 'Halo!';
    const deadlineStr = data.deadline
      ? new Date(data.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : null;

    const fields = [
      this.field('Halo', greeting),
      this.field('Pesanan', data.title),
      this.field('Status Terbaru', meta.label, meta.message),
      deadlineStr ? this.field('Deadline', deadlineStr) : '',
    ].join('');

    const html = this.html(meta.color, meta.textColor, meta.color, meta.textColor,
      '🔄 Update Status Pesanan', meta.label, fields,
      `${this.frontendUrl}/my-orders/${data.orderId}`, 'Lihat Detail Pesanan →', meta.color, meta.textColor);

    try {
      await this.transporter.sendMail({
        from:    `Synectra <${this.gmailUser}>`,
        to:      clientEmail,
        subject: `[Synectra] Status Pesanan Diperbarui: ${meta.label}`,
        html,
      });
    } catch (error) {
      this.logger.error('Gagal kirim email status order', error);
    }
  }

  async sendPaymentVerified(clientEmail: string, data: {
    orderId:      string;
    orderTitle:   string;
    amount:       number;
    clientName?:  string | null;
    paymentType?: string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const typeLabel: Record<string, string> = { dp: 'Down Payment (DP)', termin_1: 'Termin', pelunasan: 'Pelunasan' };
    const greeting = data.clientName ? `Halo, ${data.clientName}!` : 'Halo!';
    const fields = [
      this.field('Halo', greeting),
      this.field('Pesanan', data.orderTitle),
      data.paymentType ? this.field('Tipe Pembayaran', typeLabel[data.paymentType] ?? data.paymentType) : '',
      this.field('Jumlah Terverifikasi', `Rp ${data.amount.toLocaleString('id-ID')}`, 'Pembayaran kamu telah kami terima dan verifikasi. Pekerjaan akan segera dilanjutkan.'),
    ].join('');
    const html = this.html('#00C48C', '#ffffff', '#00C48C', '#ffffff',
      '✅ Pembayaran Terverifikasi', 'Verified', fields,
      `${this.frontendUrl}/my-orders/${data.orderId}`, 'Lihat Detail Pesanan →', '#00C48C', '#ffffff');
    try {
      await this.transporter.sendMail({
        from:    `Synectra <${this.gmailUser}>`,
        to:      clientEmail,
        subject: `[Synectra] Pembayaran Terverifikasi — ${data.orderTitle}`,
        html,
      });
    } catch (error) { this.logger.error('Gagal kirim email payment verified', error); }
  }

  async sendPaymentRejected(clientEmail: string, data: {
    orderId:     string;
    orderTitle:  string;
    notes:       string;
    clientName?: string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const greeting = data.clientName ? `Halo, ${data.clientName}!` : 'Halo!';
    const fields = [
      this.field('Halo', greeting),
      this.field('Pesanan', data.orderTitle),
      this.field('Alasan Penolakan', '', data.notes),
      this.field('Tindakan', 'Upload Ulang', 'Mohon upload ulang bukti transfer yang sesuai melalui aplikasi.'),
    ].join('');
    const html = this.html('#FF5C5C', '#ffffff', '#FF5C5C', '#ffffff',
      '❌ Pembayaran Ditolak', 'Ditolak', fields,
      `${this.frontendUrl}/my-orders/${data.orderId}`, 'Upload Ulang Bukti Transfer →', '#FF5C5C', '#ffffff');
    try {
      await this.transporter.sendMail({
        from:    `Synectra <${this.gmailUser}>`,
        to:      clientEmail,
        subject: `[Synectra] Pembayaran Ditolak — ${data.orderTitle}`,
        html,
      });
    } catch (error) { this.logger.error('Gagal kirim email payment rejected', error); }
  }

  async sendSoftwarePurchaseToAdmin(data: {
    purchaseId:   string;
    softwareName: string;
    totalPrice:   number;
    quantity:     number;
    clientName?:  string | null;
    clientEmail?: string | null;
  }): Promise<void> {
    if (!this.transporter) return;
    const adminEmail = await this.getAdminEmail();
    if (!adminEmail) return;

    const fields = [
      this.field('Software', data.softwareName),
      this.field('Pembeli', data.clientName ?? '—', data.clientEmail ?? undefined),
      this.field('Jumlah', String(data.quantity) + ' lisensi'),
      this.field('Total Harga', `Rp ${data.totalPrice.toLocaleString('id-ID')}`, 'Menunggu upload bukti pembayaran dari client.'),
    ].join('');

    const html = this.html('#0D0D0D', '#FFD000', '#FFD000', '#0D0D0D',
      '🖥️ Pembelian Software Baru', 'Pembelian Baru', fields,
      `${this.frontendUrl}/software-purchases`, 'Lihat Detail Pembelian →', '#FFD000', '#0D0D0D');

    try {
      await this.transporter.sendMail({
        from:    `Synectra <${this.gmailUser}>`,
        to:      adminEmail,
        subject: `[Synectra] Pembelian Software Baru: ${data.softwareName}`,
        html,
      });
    } catch (err) { this.logger.error('Gagal kirim email pembelian software ke admin', err); }
  }

  async sendSoftcopyEmail(payload: {
    clientName:  string;
    clientEmail: string;
    softwareName: string;
    softcopyUrl:  string | null;
    quantity?:    number;
    totalPrice?:  number;
  }): Promise<void> {
    if (!this.transporter) return;

    const downloadSection = payload.softcopyUrl
      ? `<a href="${payload.softcopyUrl}" class="cta">Download Softcopy →</a>`
      : `<p class="sub" style="color:#FF5C5C;">Link download sedang dipersiapkan. Admin akan menghubungi Anda segera.</p>`;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #F5F0E8; padding: 24px; }
    .wrap { max-width: 560px; margin: 0 auto; }
    .header { background: #0D0D0D; padding: 24px 28px; border: 2px solid #0D0D0D; }
    .header-title { color: #00C48C; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .header-sub { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 4px; font-family: monospace; }
    .body { background: #ffffff; border: 2px solid #0D0D0D; border-top: none; padding: 28px; }
    .badge { display: inline-block; background: #00C48C; color: #ffffff; font-size: 10px; font-weight: 800; font-family: monospace; text-transform: uppercase; padding: 4px 10px; border: 2px solid #0D0D0D; margin-bottom: 20px; }
    .field { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F0EBE3; }
    .field:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-size: 10px; font-family: monospace; text-transform: uppercase; color: rgba(13,13,13,0.5); letter-spacing: 1px; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 700; color: #0D0D0D; }
    .sub { font-size: 13px; color: rgba(13,13,13,0.6); line-height: 1.6; margin-top: 4px; }
    .cta { display: block; margin-top: 24px; padding: 14px 20px; background: #00C48C; border: 2px solid #0D0D0D; color: #ffffff; font-weight: 800; font-size: 13px; text-decoration: none; text-align: center; text-transform: uppercase; letter-spacing: 1px; box-shadow: 4px 4px 0 #0D0D0D; }
    .footer { background: #0D0D0D; border: 2px solid #0D0D0D; border-top: none; padding: 14px 28px; }
    .footer p { color: rgba(255,255,255,0.3); font-size: 11px; font-family: monospace; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-title">✅ Pembayaran Terverifikasi</div>
    <div class="header-sub">Synectra · Software Purchase</div>
  </div>
  <div class="body">
    <span class="badge">Verified</span>

    <div class="field">
      <div class="label">Halo</div>
      <div class="value">${payload.clientName}</div>
    </div>

    <div class="field">
      <div class="label">Software yang Dibeli</div>
      <div class="value">${payload.softwareName}</div>
    </div>

    ${payload.quantity ? `<div class="field"><div class="label">Jumlah Lisensi</div><div class="value">${payload.quantity} lisensi</div></div>` : ''}
    ${payload.totalPrice ? `<div class="field"><div class="label">Total Dibayar</div><div class="value" style="color:#00C48C;">Rp ${payload.totalPrice.toLocaleString('id-ID')}</div></div>` : ''}

    <div class="field">
      <div class="label">Status Pembayaran</div>
      <div class="value" style="color:#00C48C;">Terverifikasi ✓</div>
      <div class="sub">Pembayaran Anda telah dikonfirmasi. Silakan unduh softcopy di bawah ini.</div>
    </div>

    ${downloadSection}
  </div>
  <div class="footer">
    <p>Email otomatis dari sistem Synectra · Jangan balas email ini</p>
  </div>
</div>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from:    `Synectra <${this.gmailUser}>`,
        to:      payload.clientEmail,
        subject: `[Synectra] Softcopy Tersedia — ${payload.softwareName}`,
        html,
      });
      this.logger.log(`Softcopy email dikirim ke ${payload.clientEmail}`);
    } catch (error) {
      this.logger.error('Gagal mengirim softcopy email', error);
    }
  }
}

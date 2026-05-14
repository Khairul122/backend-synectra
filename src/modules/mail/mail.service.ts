import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendNewOrderNotification(order: {
    id: string;
    title: string;
    serviceCategory: string | null;
    description: string | null;
    clientName: string | null;
    clientEmail: string | null;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY belum dikonfigurasi, notifikasi tidak dikirim.');
      return;
    }

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL belum dikonfigurasi.');
      return;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://frontend-synectra.vercel.app';
    const orderDetailUrl = `${frontendUrl}/orders/${order.id}`;
    const category = order.serviceCategory?.replace(/_/g, ' ') ?? 'Tidak ditentukan';
    const description = order.description
      ? order.description.replace(/<[^>]*>/g, ' ').trim().slice(0, 400)
      : 'Tidak ada deskripsi.';

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
    .header-title { color: #FFD000; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .header-sub { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 4px; font-family: monospace; }
    .body { background: #ffffff; border: 2px solid #0D0D0D; border-top: none; padding: 28px; }
    .badge { display: inline-block; background: #FFD000; color: #0D0D0D; font-size: 10px; font-weight: 800; font-family: monospace; text-transform: uppercase; padding: 4px 10px; border: 2px solid #0D0D0D; margin-bottom: 20px; }
    .field { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F0EBE3; }
    .field:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-size: 10px; font-family: monospace; text-transform: uppercase; color: rgba(13,13,13,0.5); letter-spacing: 1px; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 700; color: #0D0D0D; }
    .sub { font-size: 13px; color: rgba(13,13,13,0.6); line-height: 1.6; margin-top: 4px; }
    .cta { display: block; margin-top: 24px; padding: 14px 20px; background: #FFD000; border: 2px solid #0D0D0D; color: #0D0D0D; font-weight: 800; font-size: 13px; text-decoration: none; text-align: center; text-transform: uppercase; letter-spacing: 1px; box-shadow: 4px 4px 0 #0D0D0D; }
    .footer { background: #0D0D0D; border: 2px solid #0D0D0D; border-top: none; padding: 14px 28px; }
    .footer p { color: rgba(255,255,255,0.3); font-size: 11px; font-family: monospace; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-title">⚡ Pesanan Baru Masuk</div>
    <div class="header-sub">Synectra · Admin Notification</div>
  </div>
  <div class="body">
    <span class="badge">New Order</span>

    <div class="field">
      <div class="label">Judul Pesanan</div>
      <div class="value">${order.title}</div>
    </div>

    <div class="field">
      <div class="label">Kategori Layanan</div>
      <div class="value">${category}</div>
    </div>

    <div class="field">
      <div class="label">Client</div>
      <div class="value">${order.clientName ?? '—'}</div>
      ${order.clientEmail ? `<div class="sub">${order.clientEmail}</div>` : ''}
    </div>

    <div class="field">
      <div class="label">Detail Kebutuhan</div>
      <div class="sub">${description}${order.description && order.description.replace(/<[^>]*>/g, '').length > 400 ? '...' : ''}</div>
    </div>

    <a href="${orderDetailUrl}" class="cta">Lihat & Kelola Pesanan →</a>
  </div>
  <div class="footer">
    <p>Email otomatis dari sistem Synectra · Jangan balas email ini</p>
  </div>
</div>
</body>
</html>`;

    try {
      await this.resend.emails.send({
        from:    'Synectra <onboarding@resend.dev>',
        to:      adminEmail,
        subject: `[Synectra] Pesanan Baru: ${order.title}`,
        html,
      });
      this.logger.log(`Notifikasi pesanan baru dikirim ke ${adminEmail}`);
    } catch (error) {
      this.logger.error('Gagal mengirim email notifikasi', error);
    }
  }

  async sendSoftcopyEmail(payload: {
    clientName: string;
    clientEmail: string;
    softwareName: string;
    softcopyUrl: string | null;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY belum dikonfigurasi, softcopy email tidak dikirim.');
      return;
    }

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
      await this.resend.emails.send({
        from:    'Synectra <onboarding@resend.dev>',
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

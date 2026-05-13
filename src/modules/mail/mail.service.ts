import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:   this.configService.get<string>('MAIL_HOST') ?? 'smtp.gmail.com',
      port:   Number(this.configService.get<string>('MAIL_PORT') ?? 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendNewOrderNotification(order: {
    id: string;
    title: string;
    serviceCategory: string | null;
    description: string | null;
    clientName: string | null;
    clientEmail: string | null;
  }): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://frontend-synectra.vercel.app';

    if (!adminEmail || !this.configService.get('MAIL_USER')) {
      this.logger.warn('Email config tidak lengkap, notifikasi tidak dikirim.');
      return;
    }

    const orderDetailUrl = `${frontendUrl}/orders/${order.id}`;
    const category = order.serviceCategory?.replace(/_/g, ' ') ?? 'Tidak ditentukan';
    const description = order.description
      ? order.description.replace(/<[^>]*>/g, ' ').trim().slice(0, 300)
      : 'Tidak ada deskripsi.';

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #F5F0E8; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { background: #0D0D0D; padding: 24px 28px; border: 2px solid #0D0D0D; }
    .header h1 { color: #FFD000; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .header p { color: #ffffff80; font-size: 11px; margin: 4px 0 0; font-family: monospace; }
    .badge { display: inline-block; background: #FFD000; color: #0D0D0D; font-size: 10px; font-weight: 800; font-family: monospace; text-transform: uppercase; padding: 3px 8px; border: 2px solid #0D0D0D; margin-bottom: 16px; }
    .body { background: #ffffff; border: 2px solid #0D0D0D; border-top: none; padding: 28px; }
    .field { margin-bottom: 18px; border-bottom: 1px solid #f0ebe3; padding-bottom: 14px; }
    .field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .field-label { font-size: 10px; font-family: monospace; text-transform: uppercase; color: #0D0D0D80; letter-spacing: 1px; margin-bottom: 4px; }
    .field-value { font-size: 15px; font-weight: 700; color: #0D0D0D; }
    .desc { font-size: 13px; font-weight: 400; color: #0D0D0D90; line-height: 1.6; }
    .cta { display: block; margin-top: 24px; padding: 14px 24px; background: #FFD000; border: 2px solid #0D0D0D; color: #0D0D0D; font-weight: 800; font-size: 13px; text-decoration: none; text-align: center; text-transform: uppercase; letter-spacing: 1px; box-shadow: 4px 4px 0 #0D0D0D; }
    .footer { padding: 14px 28px; background: #0D0D0D; border: 2px solid #0D0D0D; border-top: none; }
    .footer p { color: #ffffff40; font-size: 11px; font-family: monospace; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Pesanan Baru Masuk!</h1>
      <p>Synectra Admin Notification System</p>
    </div>
    <div class="body">
      <span class="badge">New Order</span>

      <div class="field">
        <div class="field-label">Judul Pesanan</div>
        <div class="field-value">${order.title}</div>
      </div>

      <div class="field">
        <div class="field-label">Kategori Layanan</div>
        <div class="field-value">${category}</div>
      </div>

      <div class="field">
        <div class="field-label">Client</div>
        <div class="field-value">${order.clientName ?? '—'}</div>
        <div class="desc">${order.clientEmail ?? ''}</div>
      </div>

      <div class="field">
        <div class="field-label">Detail Kebutuhan</div>
        <div class="desc">${description}${order.description && order.description.length > 300 ? '...' : ''}</div>
      </div>

      <a href="${orderDetailUrl}" class="cta">Lihat Detail Pesanan →</a>
    </div>
    <div class="footer">
      <p>Email ini dikirim otomatis oleh sistem Synectra. Jangan balas email ini.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from:    `"Synectra System" <${this.configService.get('MAIL_USER')}>`,
        to:      adminEmail,
        subject: `[Synectra] Pesanan Baru: ${order.title}`,
        html,
      });
      this.logger.log(`Email notifikasi pesanan baru dikirim ke ${adminEmail}`);
    } catch (error) {
      this.logger.error('Gagal mengirim email notifikasi', error);
    }
  }
}

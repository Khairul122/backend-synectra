import { Controller, Get, Headers, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { OrderModel } from '../../models/order.model';
import { MailService } from '../mail/mail.service';

const ACTIVE_STATUSES = new Set(['pending', 'in_progress', 'testing', 'revision']);
const REMINDER_WINDOW_DAYS = 3;

// Dipanggil Vercel Cron Job (lihat vercel.json), bukan @nestjs/schedule —
// serverless function tidak punya proses long-running untuk timer in-process
// bertahan hidup antar request. Vercel otomatis kirim header
// "Authorization: Bearer $CRON_SECRET" saat trigger cron; endpoint ini
// menolak request lain yang tidak bawa secret yang sama.
@Controller('internal/cron')
export class OrderDeadlineReminderController {
  private readonly logger = new Logger(OrderDeadlineReminderController.name);

  constructor(
    private readonly orderModel: OrderModel,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  @Get('order-deadline-reminder')
  @ApiExcludeEndpoint()
  async run(
    @Headers('authorization') auth: string | undefined,
  ): Promise<{ remindersSent: number }> {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (!secret || auth !== `Bearer ${secret}`) {
      throw new UnauthorizedException();
    }

    const orders = await this.orderModel.findAll();
    const now = Date.now();
    const windowMs = REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    const due = orders.filter((o) => {
      if (!ACTIVE_STATUSES.has(o.status) || !o.deadline || !o.clientEmail) return false;
      const msLeft = new Date(o.deadline).getTime() - now;
      return msLeft >= 0 && msLeft <= windowMs;
    });

    for (const order of due) {
      await this.mailService.sendDeadlineReminder(order.clientEmail!, {
        orderId: order.id,
        title: order.title,
        deadline: order.deadline!,
        clientName: order.clientName,
      });
    }

    this.logger.log(`Deadline reminder: ${due.length} email terkirim`);
    return { remindersSent: due.length };
  }
}

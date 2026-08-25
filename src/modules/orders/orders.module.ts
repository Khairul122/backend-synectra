import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrderDeadlineReminderController } from './order-deadline-reminder.controller';
import { OrdersService } from './orders.service';
import { OrderModel } from '../../models/order.model';
import { OrderRevisionModel } from '../../models/order-revision.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { ClientModel } from '../../models/client.model';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports:     [MailModule, SettingsModule],
  controllers: [OrdersController, OrderDeadlineReminderController],
  providers:   [OrdersService, OrderModel, OrderRevisionModel, PaymentModel, ProgressReportModel, ClientModel],
})
export class OrdersModule {}

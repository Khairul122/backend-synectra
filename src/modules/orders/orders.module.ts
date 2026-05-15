import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderModel } from '../../models/order.model';
import { OrderRevisionModel } from '../../models/order-revision.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports:     [MailModule, WhatsappModule],
  controllers: [OrdersController],
  providers:   [OrdersService, OrderModel, OrderRevisionModel, PaymentModel, ProgressReportModel],
})
export class OrdersModule {}

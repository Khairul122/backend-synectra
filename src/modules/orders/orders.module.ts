import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderModel } from '../../models/order.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:     [MailModule],
  controllers: [OrdersController],
  providers:   [OrdersService, OrderModel, PaymentModel, ProgressReportModel],
})
export class OrdersModule {}

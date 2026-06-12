import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderModel } from '../../models/order.model';
import { OrderRevisionModel } from '../../models/order-revision.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { ClientModel } from '../../models/client.model';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:     [MailModule],
  controllers: [OrdersController],
  providers:   [OrdersService, OrderModel, OrderRevisionModel, PaymentModel, ProgressReportModel, ClientModel],
})
export class OrdersModule {}

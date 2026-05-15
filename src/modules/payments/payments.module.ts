import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentModel } from '../../models/payment.model';
import { OrderModel } from '../../models/order.model';
import { ProgressReportsModule } from '../progress-reports/progress-reports.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [ProgressReportsModule, MailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentModel, OrderModel],
})
export class PaymentsModule {}

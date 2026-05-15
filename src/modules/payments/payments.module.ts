import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentModel } from '../../models/payment.model';
import { OrderModel } from '../../models/order.model';
import { ProgressReportsModule } from '../progress-reports/progress-reports.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [ProgressReportsModule, WhatsappModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentModel, OrderModel],
})
export class PaymentsModule {}

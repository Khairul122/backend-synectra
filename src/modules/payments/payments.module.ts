import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentModel } from '../../models/payment.model';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentModel],
})
export class PaymentsModule {}

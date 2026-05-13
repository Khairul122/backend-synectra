import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportsModule } from '../progress-reports/progress-reports.module';

@Module({
  imports: [ProgressReportsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentModel],
})
export class PaymentsModule {}

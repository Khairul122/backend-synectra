import { Module } from '@nestjs/common';
import { ProgressReportsController } from './progress-reports.controller';
import { ProgressReportsService } from './progress-reports.service';
import { ProgressReportModel } from '../../models/progress-report.model';
import { OrderModel } from '../../models/order.model';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:     [MailModule],
  controllers: [ProgressReportsController],
  providers:   [ProgressReportsService, ProgressReportModel, OrderModel],
  exports:     [ProgressReportModel],
})
export class ProgressReportsModule {}

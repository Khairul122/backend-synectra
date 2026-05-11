import { Module } from '@nestjs/common';
import { ProgressReportsController } from './progress-reports.controller';
import { ProgressReportsService } from './progress-reports.service';
import { ProgressReportModel } from '../../models/progress-report.model';

@Module({
  controllers: [ProgressReportsController],
  providers: [ProgressReportsService, ProgressReportModel],
})
export class ProgressReportsModule {}

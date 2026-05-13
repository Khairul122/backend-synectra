import { Injectable } from '@nestjs/common';
import { ProgressReportModel } from '../../models/progress-report.model';
import { ProgressReport } from '../../types/progress-report.types';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';

@Injectable()
export class ProgressReportsService {
  constructor(private readonly progressReportModel: ProgressReportModel) {}

  create(dto: CreateProgressReportDto): Promise<ProgressReport> {
    return this.progressReportModel.create(dto);
  }

  findByOrder(orderId: string): Promise<ProgressReport[]> {
    return this.progressReportModel.findByOrder(orderId);
  }

  unlockByOrder(orderId: string): Promise<void> {
    return this.progressReportModel.unlockByOrder(orderId);
  }
}

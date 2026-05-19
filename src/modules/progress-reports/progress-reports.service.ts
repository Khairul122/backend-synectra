import { Injectable } from '@nestjs/common';
import { ProgressReportModel } from '../../models/progress-report.model';
import { OrderModel } from '../../models/order.model';
import { MailService } from '../mail/mail.service';
import { ProgressReport } from '../../types/progress-report.types';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';

@Injectable()
export class ProgressReportsService {
  constructor(
    private readonly progressReportModel: ProgressReportModel,
    private readonly orderModel: OrderModel,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateProgressReportDto): Promise<ProgressReport> {
    const report = await this.progressReportModel.create(dto);
    // Fire-and-forget: hanya untuk notifikasi email, tidak boleh block response
    this.orderModel.findById(dto.orderId)
      .then(order => {
        if (!order?.clientEmail) return;
        this.mailService.sendProgressUpdateToClient(order.clientEmail, {
          orderId:            order.id,
          orderTitle:         order.title,
          progressTitle:      dto.title,
          progressPercentage: dto.progressPercentage,
          isLocked:           dto.isLocked ?? false,
          clientName:         order.clientName ?? null,
          description:        dto.description ?? null,
        }).catch(() => {});
      })
      .catch(() => {});
    return report;
  }

  findByOrder(orderId: string): Promise<ProgressReport[]> {
    return this.progressReportModel.findByOrder(orderId);
  }

  unlockByOrder(orderId: string): Promise<void> {
    return this.progressReportModel.unlockByOrder(orderId);
  }
}

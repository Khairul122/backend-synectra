import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProgressReportModel } from '../../models/progress-report.model';
import { OrderModel } from '../../models/order.model';
import { MailService } from '../mail/mail.service';
import { ProgressReport } from '../../types/progress-report.types';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';
import { UpdateProgressReportDto } from './dto/update-progress-report.dto';
import type { AuthUser } from '../../types/auth.types';

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

  async findByOrder(orderId: string, user: AuthUser): Promise<ProgressReport[]> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException(`Order dengan id ${orderId} tidak ditemukan`);
    if (user.role !== 'admin' && order.clientId !== user.id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    return this.progressReportModel.findByOrder(orderId);
  }

  async update(id: string, dto: UpdateProgressReportDto): Promise<ProgressReport> {
    const existing = await this.progressReportModel.findById(id);
    if (!existing) throw new NotFoundException(`Progress report dengan id ${id} tidak ditemukan`);
    const updated = await this.progressReportModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Progress report dengan id ${id} tidak ditemukan`);
    return updated;
  }

  unlockByOrder(orderId: string): Promise<void> {
    return this.progressReportModel.unlockByOrder(orderId);
  }
}

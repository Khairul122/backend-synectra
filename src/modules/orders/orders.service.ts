import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderModel } from '../../models/order.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { MailService } from '../mail/mail.service';
import { Order } from '../../types/order.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderModel: OrderModel,
    private readonly paymentModel: PaymentModel,
    private readonly progressReportModel: ProgressReportModel,
    private readonly mailService: MailService,
  ) {}

  findAll(): Promise<Order[]> {
    return this.orderModel.findAll();
  }

  findByClient(clientId: string): Promise<Order[]> {
    return this.orderModel.findByClient(clientId);
  }

  async findDetail(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    const [payments, progressReports] = await Promise.all([
      this.paymentModel.findByOrder(id),
      this.progressReportModel.findByOrder(id),
    ]);
    return { ...order, payments, progressReports };
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderModel.create(dto);

    // Kirim notifikasi email ke admin (non-blocking)
    this.mailService.sendNewOrderNotification({
      id:              order.id,
      title:           order.title,
      serviceCategory: order.serviceCategory,
      description:     order.description,
      clientName:      order.clientName ?? null,
      clientEmail:     order.clientEmail ?? null,
    }).catch(() => {}); // error email tidak memblokir response

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    const updated = await this.orderModel.updateStatus(id, dto.status);
    return updated!;
  }

  async updateDetails(id: string, dto: UpdateOrderDetailsDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    const updated = await this.orderModel.updateDetails(id, dto);
    return updated!;
  }
}

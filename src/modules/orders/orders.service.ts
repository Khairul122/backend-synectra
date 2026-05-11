import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderModel } from '../../models/order.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { Order } from '../../types/order.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderModel: OrderModel,
    private readonly paymentModel: PaymentModel,
    private readonly progressReportModel: ProgressReportModel,
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

  create(dto: CreateOrderDto): Promise<Order> {
    return this.orderModel.create(dto);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    const updated = await this.orderModel.updateStatus(id, dto.status);
    return updated!;
  }
}

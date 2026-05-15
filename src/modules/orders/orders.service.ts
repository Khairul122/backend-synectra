import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrderModel } from '../../models/order.model';
import { OrderRevisionModel } from '../../models/order-revision.model';
import { PaymentModel } from '../../models/payment.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Order } from '../../types/order.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';
import { RequestRevisionDto } from './dto/request-revision.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderModel: OrderModel,
    private readonly orderRevisionModel: OrderRevisionModel,
    private readonly paymentModel: PaymentModel,
    private readonly progressReportModel: ProgressReportModel,
    private readonly mailService: MailService,
    private readonly waService: WhatsappService,
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
    const [payments, progressReports, revisions] = await Promise.all([
      this.paymentModel.findByOrder(id),
      this.progressReportModel.findByOrder(id),
      this.orderRevisionModel.findByOrder(id),
    ]);
    return { ...order, payments, progressReports, revisions };
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderModel.create(dto);

    // Kirim notifikasi WA ke admin (non-blocking)
    this.waService.notifyAdminNewOrder({
      title:           order.title,
      clientName:      order.clientName ?? null,
      clientEmail:     order.clientEmail ?? null,
      phone:           order.phone ?? null,
      serviceCategory: order.serviceCategory ?? null,
    });

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

  async delete(id: string): Promise<void> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    await this.orderModel.delete(id);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    const updated = await this.orderModel.updateStatus(id, dto.status);
    // Notifikasi WA ke client jika order punya nomor HP (non-blocking)
    if (order.phone) {
      this.waService.notifyClientStatusChange(order.phone, { title: order.title, status: dto.status });
    }
    return updated!;
  }

  async updateDetails(id: string, dto: UpdateOrderDetailsDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    const updated = await this.orderModel.updateDetails(id, dto);
    return updated!;
  }

  async requestRevision(id: string, userId: string, dto: RequestRevisionDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    if (order.clientId !== userId) throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    if (order.status !== 'testing') {
      throw new BadRequestException(`Permintaan revisi hanya bisa dilakukan saat status order adalah "testing"`);
    }
    const items = dto.items.map(i => ({ notes: i.notes, images: i.images ?? [] }));
    await this.orderRevisionModel.create(id, items);
    const updated = await this.orderModel.updateStatus(id, 'revision');
    return updated!;
  }

  async completeByClient(id: string, userId: string, userRole: string): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);

    // Admin bisa selesaikan order siapa saja
    if (userRole !== 'admin' && order.clientId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }

    // Hanya bisa diselesaikan jika status bukan pending, completed, atau canceled
    const allowedStatuses = ['in_progress', 'testing', 'revision'];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Order dengan status "${order.status}" tidak dapat diselesaikan. Status harus in_progress, testing, atau revision.`,
      );
    }

    const updated = await this.orderModel.updateStatus(id, 'completed');
    return updated!;
  }
}

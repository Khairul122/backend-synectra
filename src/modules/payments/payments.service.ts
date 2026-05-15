import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentModel } from '../../models/payment.model';
import { OrderModel } from '../../models/order.model';
import { ProgressReportModel } from '../../models/progress-report.model';
import { Payment } from '../../types/payment.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentModel: PaymentModel,
    private readonly orderModel: OrderModel,
    private readonly progressReportModel: ProgressReportModel,
    private readonly waService: WhatsappService,
  ) {}

  async getIncome(view: string, year?: number, month?: number) {
    const payments = await this.paymentModel.findVerifiedForIncome();
    const now = new Date();
    const targetYear  = year  ?? now.getFullYear();
    const targetMonth = month ?? (now.getMonth() + 1);

    const todayStr     = now.toISOString().slice(0, 10);
    const thisMonthStr = now.toISOString().slice(0, 7);
    const thisYearStr  = String(now.getFullYear());

    const summary = {
      today:     payments.filter(p => p.verifiedAt.slice(0, 10) === todayStr).reduce((s, p) => s + p.amount, 0),
      thisMonth: payments.filter(p => p.verifiedAt.slice(0, 7) === thisMonthStr).reduce((s, p) => s + p.amount, 0),
      thisYear:  payments.filter(p => p.verifiedAt.slice(0, 4) === thisYearStr).reduce((s, p) => s + p.amount, 0),
      allTime:   payments.reduce((s, p) => s + p.amount, 0),
    };

    let points: Array<{ label: string; total: number; count: number }> = [];

    if (view === 'daily') {
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
      points = Array.from({ length: daysInMonth }, (_, i) => {
        const dayStr = `${monthStr}-${String(i + 1).padStart(2, '0')}`;
        const filtered = payments.filter(p => p.verifiedAt.slice(0, 10) === dayStr);
        return { label: dayStr, total: filtered.reduce((s, p) => s + p.amount, 0), count: filtered.length };
      });
    } else if (view === 'monthly') {
      points = Array.from({ length: 12 }, (_, i) => {
        const monthStr = `${targetYear}-${String(i + 1).padStart(2, '0')}`;
        const filtered = payments.filter(p => p.verifiedAt.slice(0, 7) === monthStr);
        return { label: monthStr, total: filtered.reduce((s, p) => s + p.amount, 0), count: filtered.length };
      });
    } else {
      const years = [...new Set(payments.map(p => p.verifiedAt.slice(0, 4)))].sort();
      if (years.length === 0) years.push(String(now.getFullYear()));
      points = years.map(y => {
        const filtered = payments.filter(p => p.verifiedAt.slice(0, 4) === y);
        return { label: y, total: filtered.reduce((s, p) => s + p.amount, 0), count: filtered.length };
      });
    }

    return { view, summary, points };
  }

  create(dto: CreatePaymentDto): Promise<Payment> {
    return this.paymentModel.create(dto);
  }

  async verify(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException(`Payment dengan id ${id} tidak ditemukan`);
    const verified = await this.paymentModel.verify(id) as Payment;
    await this.progressReportModel.unlockByOrder(verified.orderId);
    // Notifikasi WA ke client (non-blocking)
    const order = await this.orderModel.findById(verified.orderId);
    if (order?.phone) {
      this.waService.notifyClientPaymentVerified(order.phone, { title: order.title, amount: verified.amount });
    }
    return verified;
  }

  async reject(id: string, dto: RejectPaymentDto): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException(`Payment dengan id ${id} tidak ditemukan`);
    const rejected = await this.paymentModel.reject(id, dto.notes) as Payment;
    // Notifikasi WA ke client (non-blocking)
    const order = await this.orderModel.findById(rejected.orderId);
    if (order?.phone) {
      this.waService.notifyClientPaymentRejected(order.phone, { title: order.title, notes: dto.notes });
    }
    return rejected;
  }
}

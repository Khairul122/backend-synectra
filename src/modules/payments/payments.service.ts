import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentModel } from '../../models/payment.model';
import { Payment } from '../../types/payment.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentModel: PaymentModel) {}

  create(dto: CreatePaymentDto): Promise<Payment> {
    return this.paymentModel.create(dto);
  }

  async verify(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException(`Payment dengan id ${id} tidak ditemukan`);
    return this.paymentModel.verify(id) as Promise<Payment>;
  }

  async reject(id: string, dto: RejectPaymentDto): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException(`Payment dengan id ${id} tidak ditemukan`);
    return this.paymentModel.reject(id, dto.notes) as Promise<Payment>;
  }
}

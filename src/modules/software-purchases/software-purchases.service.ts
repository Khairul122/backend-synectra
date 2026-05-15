import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SoftwarePurchaseModel } from '../../models/software-purchase.model';
import { SoftwareProductModel } from '../../models/software-product.model';
import { MailService } from '../mail/mail.service';
import { SoftwarePurchase } from '../../types/software-purchase.types';
import { CreateSoftwarePurchaseDto } from './dto/create-software-purchase.dto';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { RejectPurchaseDto } from './dto/reject-purchase.dto';

@Injectable()
export class SoftwarePurchasesService {
  constructor(
    private readonly softwarePurchaseModel: SoftwarePurchaseModel,
    private readonly softwareProductModel: SoftwareProductModel,
    private readonly mailService: MailService,
  ) {}

  findAll(): Promise<SoftwarePurchase[]> {
    return this.softwarePurchaseModel.findAll();
  }

  findByClient(clientId: string): Promise<SoftwarePurchase[]> {
    return this.softwarePurchaseModel.findByClient(clientId);
  }

  async findById(id: string): Promise<SoftwarePurchase> {
    const purchase = await this.softwarePurchaseModel.findById(id);
    if (!purchase) throw new NotFoundException(`Pembelian dengan id ${id} tidak ditemukan`);
    return purchase;
  }

  async create(dto: CreateSoftwarePurchaseDto, clientId: string): Promise<SoftwarePurchase> {
    const software = await this.softwareProductModel.findById(dto.softwareId);
    if (!software || !software.isActive) {
      throw new NotFoundException(`Software tidak ditemukan atau tidak aktif`);
    }
    const quantity   = dto.quantity ?? 1;
    const totalPrice = software.price * quantity;

    const purchase = await this.softwarePurchaseModel.create({
      clientId,
      softwareId:    software.id,
      softwareName:  software.name,
      softwarePrice: software.price,
      quantity,
      totalPrice,
    });

    // Ambil data lengkap (dengan clientName & clientEmail via JOIN) lalu notif admin
    const full = await this.softwarePurchaseModel.findById(purchase.id);
    if (full) {
      this.mailService.sendSoftwarePurchaseToAdmin({
        purchaseId:   full.id,
        softwareName: full.softwareName,
        totalPrice:   full.totalPrice,
        quantity:     full.quantity ?? 1,
        clientName:   full.clientName ?? null,
        clientEmail:  full.clientEmail ?? null,
      }).catch(() => {});
    }

    return purchase;
  }

  async uploadReceipt(id: string, dto: UploadReceiptDto, clientId: string): Promise<SoftwarePurchase> {
    const purchase = await this.findById(id);
    if (purchase.clientId !== clientId) throw new ForbiddenException('Bukan pembelian Anda');
    if (purchase.paymentStatus !== 'pending_payment') {
      throw new BadRequestException('Bukti bayar hanya bisa diupload pada status menunggu pembayaran');
    }
    const updated = await this.softwarePurchaseModel.uploadReceipt(id, dto.receiptImageUrl);
    if (!updated) throw new NotFoundException(`Pembelian dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async verify(id: string): Promise<SoftwarePurchase> {
    const purchase = await this.findById(id);
    const product  = await this.softwareProductModel.findById(purchase.softwareId);
    const softcopyUrl = product?.softcopyUrl ?? null;

    const verified = await this.softwarePurchaseModel.verify(id, softcopyUrl);
    if (!verified) throw new NotFoundException(`Pembelian dengan id ${id} tidak ditemukan`);

    if (purchase.clientEmail) {
      this.mailService.sendSoftcopyEmail({
        clientName:   purchase.clientName  ?? purchase.clientEmail,
        clientEmail:  purchase.clientEmail,
        softwareName: purchase.softwareName,
        softcopyUrl,
        quantity:     purchase.quantity   ?? undefined,
        totalPrice:   purchase.totalPrice ?? undefined,
      });
    }

    return verified;
  }

  async reject(id: string, dto: RejectPurchaseDto): Promise<SoftwarePurchase> {
    await this.findById(id);
    const rejected = await this.softwarePurchaseModel.reject(id, dto.notes);
    if (!rejected) throw new NotFoundException(`Pembelian dengan id ${id} tidak ditemukan`);
    return rejected;
  }
}

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SoftwarePurchaseModel } from '../../models/software-purchase.model';
import { SoftwareProductModel } from '../../models/software-product.model';
import { SoftwarePurchase } from '../../types/software-purchase.types';
import { CreateSoftwarePurchaseDto } from './dto/create-software-purchase.dto';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { RejectPurchaseDto } from './dto/reject-purchase.dto';

@Injectable()
export class SoftwarePurchasesService {
  constructor(
    private readonly softwarePurchaseModel: SoftwarePurchaseModel,
    private readonly softwareProductModel: SoftwareProductModel,
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

    return this.softwarePurchaseModel.create({
      clientId,
      softwareId:    software.id,
      softwareName:  software.name,
      softwarePrice: software.price,
      quantity,
      totalPrice,
    });
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
    await this.findById(id);
    const verified = await this.softwarePurchaseModel.verify(id);
    if (!verified) throw new NotFoundException(`Pembelian dengan id ${id} tidak ditemukan`);
    return verified;
  }

  async reject(id: string, dto: RejectPurchaseDto): Promise<SoftwarePurchase> {
    await this.findById(id);
    const rejected = await this.softwarePurchaseModel.reject(id, dto.notes);
    if (!rejected) throw new NotFoundException(`Pembelian dengan id ${id} tidak ditemukan`);
    return rejected;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-order-id' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'dp', enum: ['dp', 'termin_1', 'pelunasan'] })
  @IsString()
  @IsNotEmpty()
  paymentType: string;

  @ApiProperty({ example: 750000 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'https://storage.example.com/receipt.jpg', required: false, description: 'Bukti transfer (opsional jika dicatat oleh admin)' })
  @IsString()
  @IsUrl()
  @IsOptional()
  receiptImageUrl?: string;

  @ApiProperty({ example: 'TRF-20240514-001', required: false, description: 'Nomor referensi transfer dari bank' })
  @IsString()
  @IsOptional()
  paymentNumber?: string;

  @ApiProperty({ example: 'Pembayaran tunai via kantor', required: false, description: 'Catatan tambahan (diisi admin)' })
  @IsString()
  @IsOptional()
  notes?: string;
}

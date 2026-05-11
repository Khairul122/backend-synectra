import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

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

  @ApiProperty({ example: 'https://storage.example.com/receipt.jpg' })
  @IsString()
  @IsNotEmpty()
  receiptImageUrl: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadReceiptDto {
  @ApiProperty({ example: 'https://storage.supabase.co/bukti.jpg' })
  @IsString()
  @IsNotEmpty()
  receiptImageUrl: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UploadReceiptDto {
  @ApiProperty({ example: 'https://storage.supabase.co/bukti.jpg' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  receiptImageUrl: string;
}

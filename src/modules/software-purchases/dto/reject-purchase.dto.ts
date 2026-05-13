import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectPurchaseDto {
  @ApiProperty({ example: 'Bukti transfer tidak terbaca dengan jelas.' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}

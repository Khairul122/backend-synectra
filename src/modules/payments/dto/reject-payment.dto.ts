import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectPaymentDto {
  @ApiProperty({ example: 'Jumlah transfer tidak sesuai' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}

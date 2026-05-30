import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CarryForwardDto {
  @ApiProperty({ example: '2026-05-29', description: 'Tanggal sumber (todos belum selesai akan disalin dari sini)' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2026-05-30', description: 'Tanggal tujuan (todos akan disalin ke sini)' })
  @IsDateString()
  toDate: string;
}

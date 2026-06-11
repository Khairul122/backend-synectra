import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RespondRevisionDto {
  @ApiProperty({ example: 'Revisi sudah dikerjakan, silakan cek hasilnya.' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ example: ['https://...jpg', 'https://...png'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

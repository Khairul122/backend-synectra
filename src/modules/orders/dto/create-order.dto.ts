import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-client-id', required: false })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ example: 'Pembuatan Web Company Profile' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'software_development', required: false })
  @IsString()
  @IsOptional()
  serviceCategory?: string;

  @ApiProperty({ example: 'Membuat website company profile dengan CMS', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1500000, required: false })
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @ApiProperty({ example: '2025-08-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ example: '08123456789', required: false, description: 'Nomor HP / WhatsApp client' })
  @IsString()
  @IsOptional()
  phone?: string;
}

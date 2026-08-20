import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl, Max, Min } from 'class-validator';

export class CreateProgressReportDto {
  @ApiProperty({ example: 'uuid-order-id' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'Selesai membuat fitur Login' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Fitur login dengan email/password sudah berfungsi', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @ApiProperty({ example: 'https://storage.example.com/screenshot.png', required: false })
  @IsString()
  @IsUrl()
  @IsOptional()
  attachmentUrl?: string;

  @ApiProperty({ example: false, required: false, description: 'Kunci detail dari client sampai payment diverifikasi' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}

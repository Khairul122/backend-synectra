import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

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
  @IsOptional()
  attachmentUrl?: string;
}

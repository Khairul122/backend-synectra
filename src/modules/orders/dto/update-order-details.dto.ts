import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDetailsDto {
  @ApiProperty({ example: 1500000, required: false })
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @ApiProperty({ example: '2025-08-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ example: 'Detail tambahan dari admin', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

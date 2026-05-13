import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServicePackageDto {
  @ApiProperty({ example: 'Paket Starter' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Starter Package', required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ example: 'Paket terjangkau untuk kebutuhan dasar', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Affordable package for basic needs', required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: '2 Minggu', required: false })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({ example: '2 Weeks', required: false })
  @IsString()
  @IsOptional()
  durationEn?: string;

  @ApiProperty({ example: 'Desain responsif\nRevisi 2x\nSumber file', required: false, description: 'Satu fitur per baris' })
  @IsString()
  @IsOptional()
  features?: string;

  @ApiProperty({ example: 'Responsive design\n2 revisions\nSource files included', required: false })
  @IsString()
  @IsOptional()
  featuresEn?: string;

  @ApiProperty({ example: 'Paling Populer', required: false })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty({ example: 'Most Popular', required: false })
  @IsString()
  @IsOptional()
  badgeEn?: string;

  @ApiProperty({ example: 'https://storage.supabase.co/...', required: false })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiProperty({ example: 'Web', required: false, enum: ['Web', 'Mobile', 'UI/UX', 'Tugas', 'Lainnya'] })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

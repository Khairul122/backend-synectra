import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSoftwareProductDto {
  @ApiProperty({ example: 'POS Kasir UMKM' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'POS Cashier System', required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ example: 'Sistem kasir modern untuk toko dan UMKM', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Modern POS cashier system for shops and SMEs', required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ example: 'Web App', required: false, enum: ['Web App', 'Mobile App', 'Desktop App', 'SaaS', 'Template', 'Script'] })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'https://demo.example.com', required: false })
  @IsString()
  @IsOptional()
  demoUrl?: string;

  @ApiProperty({ example: 'https://storage.supabase.co/...', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'React\nNestJS\nPostgreSQL', required: false, description: 'Satu teknologi per baris' })
  @IsString()
  @IsOptional()
  techStack?: string;

  @ApiProperty({ example: 'Multi kasir\nLaporan harian\nManajemen stok', required: false, description: 'Satu fitur per baris' })
  @IsString()
  @IsOptional()
  features?: string;

  @ApiProperty({ example: 'Multi cashier\nDaily reports\nInventory management', required: false })
  @IsString()
  @IsOptional()
  featuresEn?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

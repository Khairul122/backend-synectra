import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'Banner Promo Lebaran 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Eid Sale Banner', required: false, description: 'Judul dalam Bahasa Inggris' })
  @IsString()
  @IsOptional()
  titleEn?: string;

  @ApiProperty({ example: '<p>Deskripsi banner dalam format HTML</p>', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '<p>Banner description in HTML</p>', required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg', required: false })
  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

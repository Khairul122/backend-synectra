import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl, MaxLength } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'Synectra Platform' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Deskripsi proyek...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 'Web App', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;
}

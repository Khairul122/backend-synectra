import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSocialMediaDto {
  @ApiProperty({ example: 'Instagram' })
  @IsString()
  @IsNotEmpty()
  platformName: string;

  @ApiProperty({ example: '@synectra' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ example: 'https://instagram.com/synectra' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'https://example.com/instagram-icon.png', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

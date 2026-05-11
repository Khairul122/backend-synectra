import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactChannelDto {
  @ApiProperty({ example: 'Customer Service' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 'WhatsApp' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: '+6281234567890' })
  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  @ApiProperty({ example: 'https://wa.me/6281234567890' })
  @IsString()
  @IsNotEmpty()
  linkUrl: string;

  @ApiProperty({ example: 'whatsapp' })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

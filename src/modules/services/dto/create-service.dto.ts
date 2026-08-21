import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const ICON_KEYS = ['code', 'mobile', 'design', 'api', 'cloud', 'chat'] as const;

export class CreateServiceDto {
  @ApiProperty({ example: 'Web Development' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Web Development', required: false })
  @IsString()
  @IsOptional()
  titleEn?: string;

  @ApiProperty({ example: 'Membangun website modern, cepat, dan responsif', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Building modern, fast, and responsive websites', required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ example: 'code', enum: ICON_KEYS, required: false, default: 'code' })
  @IsString()
  @IsIn(ICON_KEYS)
  @IsOptional()
  iconKey?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class AdminRevisionItemDto {
  @ApiProperty({ example: 'Tambahkan validasi nomor telepon di form pendaftaran.' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ example: ['https://...jpg', 'https://...png'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class CreateAdminRevisionDto {
  @ApiProperty({ type: [AdminRevisionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminRevisionItemDto)
  items: AdminRevisionItemDto[];
}

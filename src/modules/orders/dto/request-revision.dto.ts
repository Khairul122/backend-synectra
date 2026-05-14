import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class RevisionItemDto {
  @ApiProperty({ example: 'Tampilan halaman login perlu disesuaikan dengan mockup terbaru.' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ example: ['https://...jpg', 'https://...png'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class RequestRevisionDto {
  @ApiProperty({ type: [RevisionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RevisionItemDto)
  items: RevisionItemDto[];
}

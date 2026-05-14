import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestRevisionDto {
  @ApiProperty({ example: 'Tampilan halaman login perlu disesuaikan dengan mockup terbaru.' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}

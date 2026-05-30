import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({ example: 'Buat laporan bulanan (diupdate)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

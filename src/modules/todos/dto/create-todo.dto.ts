import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'Buat laporan bulanan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: '2026-05-30' })
  @IsDateString()
  todoDate: string;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

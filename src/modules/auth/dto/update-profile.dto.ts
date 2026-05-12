import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Budi Santoso', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'budi@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @ApiProperty({ example: 'PT Maju Bersama', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: 'client@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}

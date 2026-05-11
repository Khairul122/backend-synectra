import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'BCA' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'PT Synectra Indonesia' })
  @IsString()
  @IsNotEmpty()
  accountHolder: string;

  @ApiProperty({ example: 'https://example.com/bca-logo.png', required: false })
  @IsString()
  @IsUrl()
  @IsOptional()
  bankLogo?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

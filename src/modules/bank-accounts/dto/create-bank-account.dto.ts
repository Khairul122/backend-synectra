import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

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

  @ApiProperty({ example: 'bank', enum: ['bank', 'qris', 'both'], required: false, default: 'bank' })
  @IsIn(['bank', 'qris', 'both'])
  @IsOptional()
  paymentType?: 'bank' | 'qris' | 'both';

  @ApiProperty({ example: 'https://storage.example.com/qris.png', required: false })
  @IsString()
  @IsUrl()
  @IsOptional()
  qrisImageUrl?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateSignatureDto {
  @ApiProperty({ example: 'https://xxxx.supabase.co/storage/v1/object/public/company-signature/sig.png' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  signatureUrl: string;
}

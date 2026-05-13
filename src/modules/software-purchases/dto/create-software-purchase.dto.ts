import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateSoftwarePurchaseDto {
  @ApiProperty({ example: 'uuid-software-id' })
  @IsUUID()
  @IsNotEmpty()
  softwareId: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

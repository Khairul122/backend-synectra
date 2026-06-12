import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderPriorityDto {
  @ApiProperty({ example: 'high', enum: ['low', 'normal', 'high'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['low', 'normal', 'high'])
  priority: string;
}

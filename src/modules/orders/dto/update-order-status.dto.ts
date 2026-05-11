import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'in_progress', enum: ['pending','in_progress','testing','revision','completed','canceled'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'in_progress', 'testing', 'revision', 'completed', 'canceled'])
  status: string;
}

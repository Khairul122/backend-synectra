import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleTodoDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean;
}

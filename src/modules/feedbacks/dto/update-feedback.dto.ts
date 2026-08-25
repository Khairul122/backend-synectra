import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateFeedbackDto } from './create-feedback.dto';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @ApiProperty({ example: true, required: false, description: 'Admin only — approve/sembunyikan dari landing page' })
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}

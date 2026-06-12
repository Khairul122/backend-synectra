import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProgressReportDto } from './create-progress-report.dto';

export class UpdateProgressReportDto extends PartialType(
  OmitType(CreateProgressReportDto, ['orderId'] as const),
) {}

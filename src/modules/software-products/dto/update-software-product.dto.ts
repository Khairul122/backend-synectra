import { PartialType } from '@nestjs/swagger';
import { CreateSoftwareProductDto } from './create-software-product.dto';

export class UpdateSoftwareProductDto extends PartialType(CreateSoftwareProductDto) {}

import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

// Hanya field yang benar-benar kita pakai — payload asli GitHub jauh lebih besar
// (organization, sender, permissions, dll) dan bisa berubah sewaktu-waktu.
export class GithubRepositoryDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  html_url: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsBoolean()
  private: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsString()
  homepage?: string | null;

  @IsString()
  full_name: string;

  @IsString()
  default_branch: string;
}

export class GithubRepositoryWebhookDto {
  // Nilai lain di luar daftar HANDLED_ACTIONS milik service juga sah (mis. "deleted",
  // "archived") — dibiarkan `string` biasa karena kita hanya cek keanggotaan lewat Set, bukan narrowing.
  @IsString()
  action: string;

  @ValidateNested()
  @Type(() => GithubRepositoryDto)
  repository: GithubRepositoryDto;
}

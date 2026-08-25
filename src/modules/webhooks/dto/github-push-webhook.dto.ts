import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { GithubRepositoryDto } from './github-repository-webhook.dto';

// GitHub batasi maksimal 20 commit di payload push — cukup untuk cek file yang
// disentuh, tidak perlu Compare API untuk push sebesar apapun.
export class GithubPushCommitDto {
  @IsArray()
  @IsString({ each: true })
  added: string[];

  @IsArray()
  @IsString({ each: true })
  modified: string[];

  @IsArray()
  @IsString({ each: true })
  removed: string[];
}

export class GithubPushWebhookDto {
  @IsString()
  ref: string;

  @ValidateNested()
  @Type(() => GithubRepositoryDto)
  repository: GithubRepositoryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GithubPushCommitDto)
  commits: GithubPushCommitDto[];
}

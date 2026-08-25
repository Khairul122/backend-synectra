import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PortfolioModel } from '../../models/portfolio.model';
import { GithubRepositoryWebhookDto } from './dto/github-repository-webhook.dto';
import { invalidateCache } from '../../common/utils/memory-cache';
import {
  fetchGithubCoverImage,
  fetchGithubRawFile,
} from '../../common/utils/github-content';

const HANDLED_ACTIONS = new Set(['created', 'edited', 'publicized']);

@Injectable()
export class GithubWebhookService {
  private readonly logger = new Logger(GithubWebhookService.name);

  constructor(
    private readonly portfolioModel: PortfolioModel,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @returns true kalau repo di-upsert ke portfolio, false kalau di-skip (tidak lolos filter)
   */
  async handleRepositoryEvent(
    payload: GithubRepositoryWebhookDto,
  ): Promise<boolean> {
    if (!HANDLED_ACTIONS.has(payload.action)) return false;

    const topic = this.configService.get<string>('github.portfolioTopic')!;
    const repo = payload.repository;
    const isEligible =
      repo.private === false && (repo.topics ?? []).includes(topic);
    if (!isEligible) return false;

    const [descriptionFile, categoryFile, cover] = await Promise.all([
      fetchGithubRawFile(repo.full_name, repo.default_branch, 'deskripsi.md'),
      fetchGithubRawFile(repo.full_name, repo.default_branch, 'kategori.md'),
      fetchGithubCoverImage(repo.full_name, repo.default_branch),
    ]);
    const image = cover
      ? await this.portfolioModel.uploadGithubCoverImage(
          repo.id,
          cover.buffer,
          cover.filename,
        )
      : undefined;

    await this.portfolioModel.upsertFromGithubRepo({
      githubRepoId: repo.id,
      title: repo.name,
      description: descriptionFile?.toString('utf8').trim() || repo.description,
      repoUrl: repo.html_url,
      category: categoryFile?.toString('utf8').trim().split('\n')[0],
      image,
    });
    invalidateCache('portfolio:findAll');

    this.logger.log(
      `Repo "${repo.name}" di-publish ke portfolio (topic: ${topic})`,
    );
    return true;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PortfolioModel } from '../../models/portfolio.model';
import { GithubRepositoryWebhookPayload } from '../../types/github-webhook.types';

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
    payload: GithubRepositoryWebhookPayload,
  ): Promise<boolean> {
    if (!HANDLED_ACTIONS.has(payload.action)) return false;

    const topic = this.configService.get<string>('github.portfolioTopic')!;
    const repo = payload.repository;
    const isEligible =
      repo.private === false && (repo.topics ?? []).includes(topic);
    if (!isEligible) return false;

    await this.portfolioModel.upsertFromGithubRepo({
      githubRepoId: repo.id,
      title: repo.name,
      description: repo.description,
      repoUrl: repo.html_url,
    });

    this.logger.log(
      `Repo "${repo.name}" di-publish ke portfolio (topic: ${topic})`,
    );
    return true;
  }
}

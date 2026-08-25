import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PortfolioModel } from '../../models/portfolio.model';
import {
  GithubRepositoryDto,
  GithubRepositoryWebhookDto,
} from './dto/github-repository-webhook.dto';
import { GithubPushWebhookDto } from './dto/github-push-webhook.dto';
import { invalidateCache } from '../../common/utils/memory-cache';
import {
  fetchGithubCoverImage,
  fetchGithubRawFile,
} from '../../common/utils/github-content';

const HANDLED_ACTIONS = new Set(['created', 'edited', 'publicized']);

// File yang kalau disentuh di sebuah push, layak trigger sync ulang portfolio.
const TRACKED_FILES = new Set([
  'deskripsi.md',
  'kategori.md',
  'cover.png',
  'cover.jpg',
  'cover.jpeg',
  'cover.webp',
]);

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
    if (!this.isEligible(payload.repository)) return false;

    await this.syncPortfolioFiles(
      payload.repository,
      payload.repository.default_branch,
    );
    return true;
  }

  /**
   * Event "repository" (edited/created/publicized) tidak fire saat commit biasa
   * nambah/ubah deskripsi.md/kategori.md/cover.* — hanya saat metadata repo
   * (description/homepage/topics) berubah. Event "push" ini nutup celah itu:
   * hanya diproses kalau push ke branch default DAN menyentuh salah satu file
   * yang di-track, supaya tidak fetch GitHub di setiap commit yang tidak relevan.
   */
  async handlePushEvent(payload: GithubPushWebhookDto): Promise<boolean> {
    const repo = payload.repository;
    if (payload.ref !== `refs/heads/${repo.default_branch}`) return false;

    const touchedTrackedFile = payload.commits.some((commit) =>
      [...commit.added, ...commit.modified, ...commit.removed].some((path) =>
        TRACKED_FILES.has(path),
      ),
    );
    if (!touchedTrackedFile) return false;
    if (!this.isEligible(repo)) return false;

    await this.syncPortfolioFiles(repo, payload.after);
    return true;
  }

  private isEligible(repo: GithubRepositoryDto): boolean {
    const topic = this.configService.get<string>('github.portfolioTopic')!;
    return repo.private === false && (repo.topics ?? []).includes(topic);
  }

  private async syncPortfolioFiles(
    repo: GithubRepositoryDto,
    ref: string,
  ): Promise<void> {
    const [descriptionFile, categoryFile, cover] = await Promise.all([
      fetchGithubRawFile(repo.full_name, ref, 'deskripsi.md'),
      fetchGithubRawFile(repo.full_name, ref, 'kategori.md'),
      fetchGithubCoverImage(repo.full_name, ref),
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
      link: repo.homepage || undefined,
    });
    invalidateCache('portfolio:findAll');

    this.logger.log(`Repo "${repo.name}" di-sync ke portfolio`);
  }
}

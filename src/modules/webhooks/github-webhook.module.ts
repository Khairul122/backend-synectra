import { Module } from '@nestjs/common';
import { GithubWebhookController } from './github-webhook.controller';
import { GithubWebhookService } from './github-webhook.service';
import { PortfolioModel } from '../../models/portfolio.model';

@Module({
  controllers: [GithubWebhookController],
  providers: [GithubWebhookService, PortfolioModel],
})
export class GithubWebhookModule {}

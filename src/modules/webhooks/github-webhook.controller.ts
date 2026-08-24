import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { GithubWebhookService } from './github-webhook.service';
import { verifyGithubSignature } from '../../common/utils/github-signature';
import { GithubRepositoryWebhookPayload } from '../../types/github-webhook.types';

@ApiTags('webhooks')
@Controller('webhooks/github')
export class GithubWebhookController {
  constructor(
    private readonly webhookService: GithubWebhookService,
    private readonly configService: ConfigService,
  ) {}

  // Endpoint ini dipanggil GitHub, bukan user login — otentikasi via HMAC
  // signature (bukan JwtAuthGuard), dan sengaja tidak disembunyikan dari
  // publik lewat guard karena memang begitu cara kerja webhook.
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Terima event repository dari GitHub Org webhook (internal)',
  })
  async handle(
    @Req() req: Request,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Headers('x-github-event') eventName: string | undefined,
  ): Promise<{ received: boolean; processed: boolean }> {
    const secret = this.configService.get<string>('github.webhookSecret');
    const rawBody = req.body as Buffer;

    if (
      !secret ||
      !Buffer.isBuffer(rawBody) ||
      !verifyGithubSignature(rawBody, signature, secret)
    ) {
      throw new UnauthorizedException('Signature webhook tidak valid');
    }

    if (eventName !== 'repository') {
      return { received: true, processed: false };
    }

    let payload: GithubRepositoryWebhookPayload;
    try {
      payload = JSON.parse(
        rawBody.toString('utf8'),
      ) as GithubRepositoryWebhookPayload;
    } catch {
      throw new BadRequestException('Payload bukan JSON yang valid');
    }

    const processed = await this.webhookService.handleRepositoryEvent(payload);
    return { received: true, processed };
  }
}

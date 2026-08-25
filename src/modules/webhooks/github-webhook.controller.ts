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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Request } from 'express';
import { GithubWebhookService } from './github-webhook.service';
import { verifyGithubSignature } from '../../common/utils/github-signature';
import { GithubRepositoryWebhookDto } from './dto/github-repository-webhook.dto';
import { GithubPushWebhookDto } from './dto/github-push-webhook.dto';

@ApiTags('webhooks')
@SkipThrottle()
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
    summary: 'Terima event repository/push dari GitHub Org webhook (internal)',
  })
  @ApiResponse({ status: 200, description: 'Event diterima dan diproses' })
  @ApiResponse({ status: 400, description: 'Payload bukan JSON yang valid' })
  @ApiResponse({ status: 401, description: 'Signature webhook tidak valid' })
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

    const parsedBody = this.parseJsonBody(rawBody);
    const processed = await this.dispatchEvent(eventName, parsedBody);
    return { received: true, processed };
  }

  private parseJsonBody(rawBody: Buffer): unknown {
    try {
      return JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Payload bukan JSON yang valid');
    }
  }

  // event lain (mis. "ping") sengaja dibiarkan lewat sebagai processed: false,
  // bukan error — webhook memang subscribe beberapa event sekaligus di GitHub.
  private async dispatchEvent(
    eventName: string | undefined,
    parsedBody: unknown,
  ): Promise<boolean> {
    if (eventName === 'repository') {
      const payload = await this.validateDto(
        GithubRepositoryWebhookDto,
        parsedBody,
      );
      return this.webhookService.handleRepositoryEvent(payload);
    }
    if (eventName === 'push') {
      const payload = await this.validateDto(GithubPushWebhookDto, parsedBody);
      return this.webhookService.handlePushEvent(payload);
    }
    return false;
  }

  private async validateDto<T extends object>(
    cls: new () => T,
    parsedBody: unknown,
  ): Promise<T> {
    const payload = plainToInstance(cls, parsedBody);
    const errors = await validate(payload);
    if (errors.length > 0) {
      throw new BadRequestException('Payload webhook tidak valid');
    }
    return payload;
  }
}

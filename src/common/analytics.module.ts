import { Module, Global } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';

/**
 * Analytics Module
 *
 * Global module that provides Vercel Web Analytics integration.
 * The AnalyticsService is exported and can be used throughout the application
 * to track custom events.
 */
@Global()
@Module({
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

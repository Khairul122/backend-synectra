import { Module, Global } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/**
 * Analytics Module - Global module untuk Vercel Analytics integration
 *
 * Module ini menyediakan AnalyticsService yang dapat digunakan di seluruh aplikasi
 * untuk tracking custom events dan API usage.
 *
 * Karena di-mark sebagai @Global, tidak perlu import module ini di setiap module lain.
 */
@Global()
@Module({
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

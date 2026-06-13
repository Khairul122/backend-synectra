import { Injectable, Logger } from '@nestjs/common';
import { track } from '@vercel/analytics/server';

/**
 * Service untuk tracking events menggunakan Vercel Analytics (server-side).
 *
 * Vercel Web Analytics utamanya dirancang untuk frontend/browser tracking,
 * namun package ini juga menyediakan API server-side untuk tracking custom events.
 *
 * Catatan: Server-side tracking hanya berfungsi di production environment Vercel.
 * Di development mode, events tidak akan dikirim.
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly isVercel = !!process.env.VERCEL;

  /**
   * Track custom event ke Vercel Analytics
   *
   * @param eventName - Nama event (contoh: 'order_created', 'payment_completed')
   * @param properties - Properties tambahan untuk event
   * @param options - Options untuk request (headers, flags)
   *
   * @example
   * await this.analyticsService.trackEvent('order_created', {
   *   orderId: order.id,
   *   totalAmount: order.total,
   *   userId: order.userId
   * });
   */
  async trackEvent(
    eventName: string,
    properties?: Record<string, string | number | boolean | null | undefined>,
    options?: {
      flags?: Record<string, unknown>;
      headers?: Record<string, string | string[] | undefined>;
    },
  ): Promise<void> {
    // Hanya track di production environment dan deployment Vercel
    if (!this.isProduction || !this.isVercel) {
      this.logger.debug(
        `Analytics tracking skipped (not in production Vercel): ${eventName}`,
      );
      return;
    }

    try {
      await track(eventName, properties, options);
      this.logger.debug(`Event tracked: ${eventName}`);
    } catch (error) {
      // Log error tapi jangan throw - analytics failure tidak boleh break app logic
      this.logger.error(`Failed to track event ${eventName}:`, error);
    }
  }

  /**
   * Track API endpoint usage
   *
   * @param endpoint - API endpoint yang diakses (contoh: 'POST /api/orders')
   * @param metadata - Metadata tambahan seperti user ID, status code, dll
   */
  async trackApiUsage(
    endpoint: string,
    metadata?: Record<string, string | number | boolean>,
  ): Promise<void> {
    await this.trackEvent('api_usage', {
      endpoint,
      ...metadata,
    });
  }

  /**
   * Track business events (order, payment, dll)
   *
   * @param eventType - Tipe event bisnis
   * @param data - Data terkait event
   */
  async trackBusinessEvent(
    eventType: string,
    data: Record<string, string | number | boolean>,
  ): Promise<void> {
    await this.trackEvent(`business_${eventType}`, data);
  }
}

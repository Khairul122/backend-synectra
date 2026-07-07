import { Injectable, Logger } from '@nestjs/common';
import { track } from '@vercel/analytics/server';

/**
 * Analytics Service
 *
 * Provides methods to track custom events using Vercel Web Analytics.
 * This service can be injected into any module to track specific business events.
 *
 * @example
 * ```typescript
 * constructor(private readonly analyticsService: AnalyticsService) {}
 *
 * async createOrder(data: CreateOrderDto) {
 *   const order = await this.orderRepository.save(data);
 *   await this.analyticsService.trackEvent('Order Created', {
 *     orderId: order.id,
 *     amount: order.amount,
 *   });
 *   return order;
 * }
 * ```
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  /**
   * Track a custom event with optional metadata
   *
   * @param eventName - The name of the event to track (max 255 characters)
   * @param properties - Optional event metadata (strings, numbers, booleans, or null)
   * @returns Promise that resolves when tracking is complete
   *
   * Note: Only tracks in production environment. Development tracking is disabled.
   */
  async trackEvent(
    eventName: string,
    properties?: Record<string, string | number | boolean | null>,
  ): Promise<void> {
    // Only track in production to avoid unnecessary API calls during development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[DEV] Would track event: ${eventName}`, properties);
      return;
    }

    try {
      await track(eventName, properties);
      this.logger.debug(`Tracked event: ${eventName}`);
    } catch (error) {
      // Log the error but don't throw to avoid disrupting business logic
      this.logger.error(
        `Failed to track event "${eventName}": ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Track user authentication events
   */
  async trackAuth(
    action: 'login' | 'logout' | 'register',
    userId?: string,
  ): Promise<void> {
    await this.trackEvent('User Authentication', {
      action,
      userId: userId || 'anonymous',
    });
  }

  /**
   * Track business-critical events like order creation, payment, etc.
   */
  async trackBusinessEvent(
    category: string,
    action: string,
    metadata?: Record<string, string | number | boolean | null>,
  ): Promise<void> {
    await this.trackEvent(`${category} - ${action}`, metadata);
  }
}

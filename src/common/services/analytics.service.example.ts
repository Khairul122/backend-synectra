/**
 * Analytics Service Usage Examples
 *
 * This file demonstrates how to use the AnalyticsService throughout the application
 * to track custom business events with Vercel Web Analytics.
 */

import { Injectable } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class ExampleService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Example 1: Track user authentication events
   */
  async loginExample(userId: string) {
    // Your login logic here
    const user = { id: userId, email: 'user@example.com' };

    // Track the login event
    await this.analyticsService.trackAuth('login', userId);

    return user;
  }

  /**
   * Example 2: Track business events like order creation
   */
  async createOrderExample(orderData: any) {
    // Your order creation logic here
    const order = { id: '123', amount: 1000, ...orderData };

    // Track the order creation
    await this.analyticsService.trackBusinessEvent('Order', 'Created', {
      orderId: order.id,
      amount: order.amount,
      status: 'pending',
    });

    return order;
  }

  /**
   * Example 3: Track custom events with metadata
   */
  async exportReportExample(reportType: string, userId: string) {
    // Your export logic here
    const report = { type: reportType, generatedAt: new Date() };

    // Track the export event
    await this.analyticsService.trackEvent('Report Exported', {
      reportType,
      userId,
      timestamp: Date.now(),
    });

    return report;
  }

  /**
   * Example 4: Track payment events
   */
  async processPaymentExample(paymentData: any) {
    try {
      // Your payment processing logic here
      const payment = { id: '456', amount: 500, ...paymentData };

      // Track successful payment
      await this.analyticsService.trackBusinessEvent('Payment', 'Completed', {
        paymentId: payment.id,
        amount: payment.amount,
        method: 'credit_card',
      });

      return payment;
    } catch (error) {
      // Track failed payment
      await this.analyticsService.trackBusinessEvent('Payment', 'Failed', {
        amount: paymentData.amount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Example 5: Track user registration
   */
  async registerUserExample(email: string) {
    // Your registration logic here
    const user = { id: 'new-user-id', email };

    // Track the registration
    await this.analyticsService.trackAuth('register', user.id);

    return user;
  }

  /**
   * Example 6: Track file uploads
   */
  async uploadFileExample(fileName: string, fileSize: number) {
    // Your upload logic here
    const file = { name: fileName, size: fileSize };

    // Track the upload
    await this.analyticsService.trackEvent('File Uploaded', {
      fileName,
      fileSize,
      success: true,
    });

    return file;
  }
}

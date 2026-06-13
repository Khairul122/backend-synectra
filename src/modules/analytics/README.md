# Vercel Analytics Integration

Module ini menyediakan integrasi Vercel Web Analytics untuk backend NestJS.

## Overview

Vercel Web Analytics utamanya dirancang untuk tracking frontend/browser pageviews. Namun, package `@vercel/analytics` juga menyediakan API server-side untuk tracking custom events dari backend.

**Penting:** Server-side tracking hanya berfungsi di production environment Vercel. Events tidak akan dikirim di development mode.

## Setup

Analytics module sudah dikonfigurasi sebagai global module, sehingga `AnalyticsService` tersedia di seluruh aplikasi tanpa perlu import module-nya lagi.

## Cara Penggunaan

### 1. Inject AnalyticsService

Inject service di constructor:

```typescript
import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics';

@Injectable()
export class OrdersService {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}
}
```

### 2. Track Custom Events

Track event generik:

```typescript
await this.analyticsService.trackEvent('order_created', {
  orderId: order.id,
  totalAmount: order.total_amount,
  packageName: order.package_name,
  userId: order.user_id,
});
```

### 3. Track API Usage

Track penggunaan endpoint API:

```typescript
await this.analyticsService.trackApiUsage('POST /api/orders', {
  userId: user.id,
  statusCode: 201,
  duration: Date.now() - startTime,
});
```

### 4. Track Business Events

Track event bisnis spesifik:

```typescript
await this.analyticsService.trackBusinessEvent('payment_completed', {
  orderId: payment.order_id,
  amount: payment.amount,
  method: payment.method,
});
```

## Contoh Implementasi

### Tracking Order Creation

```typescript
// src/modules/orders/orders.service.ts
import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics';

@Injectable()
export class OrdersService {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
    // Create order logic
    const order = await this.createOrder(dto, userId);

    // Track analytics
    await this.analyticsService.trackBusinessEvent('order_created', {
      orderId: order.id,
      userId: userId,
      packageId: dto.service_package_id,
      totalAmount: order.total_amount,
      priority: order.priority,
    });

    return order;
  }
}
```

### Tracking Payment Confirmation

```typescript
// src/modules/payments/payments.service.ts
async confirmPayment(id: string, file: Express.Multer.File) {
  const payment = await this.updatePaymentStatus(id, file);

  await this.analyticsService.trackBusinessEvent('payment_confirmed', {
    paymentId: id,
    orderId: payment.order_id,
    amount: payment.amount,
  });

  return payment;
}
```

### Tracking Authentication Events

```typescript
// src/modules/auth/auth.service.ts
async login(email: string, password: string) {
  const result = await this.validateAndLogin(email, password);

  await this.analyticsService.trackEvent('user_login', {
    userId: result.user.id,
    method: 'email',
  });

  return result;
}
```

## Event Naming Conventions

Gunakan naming convention berikut untuk konsistensi:

### Event Types

- **Business Events**: `business_*` (otomatis ditambahkan oleh `trackBusinessEvent`)
  - `business_order_created`
  - `business_payment_confirmed`
  - `business_order_completed`

- **API Events**: `api_usage` dengan property `endpoint`
  - Property: `{ endpoint: 'POST /api/orders', statusCode: 201 }`

- **Auth Events**: `user_*`
  - `user_login`
  - `user_logout`
  - `user_registered`

- **Custom Events**: gunakan snake_case
  - `contact_submitted`
  - `feedback_created`
  - `software_purchased`

## Best Practices

1. **Jangan Block Request**: Analytics tracking bersifat fire-and-forget. Error di analytics tidak boleh mempengaruhi business logic.

2. **Minimal Data**: Track hanya data yang diperlukan. Hindari tracking PII (Personally Identifiable Information) yang sensitif.

3. **Async Tracking**: Gunakan `await` tapi pastikan error handling tidak break flow:
   ```typescript
   // Service sudah handle error internally, tidak akan throw
   await this.analyticsService.trackEvent('event_name', { data: 'value' });
   ```

4. **Development Mode**: Events otomatis di-skip di development, tidak perlu conditional logic tambahan.

## Melihat Data Analytics

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project backend-synectra
3. Navigasi ke tab **Analytics**
4. Custom events akan muncul di section **Custom Events**

## Troubleshooting

### Events Tidak Muncul di Dashboard

- Pastikan aplikasi berjalan di production Vercel (`NODE_ENV=production` dan `VERCEL` env var ada)
- Web Analytics sudah diaktifkan di Vercel Dashboard
- Tunggu beberapa menit, data tidak real-time
- Cek logs untuk error di analytics tracking

### Development Testing

Di development, events tidak akan dikirim. Untuk testing, deploy ke Vercel preview atau production.

## References

- [Vercel Web Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Analytics Package](https://vercel.com/docs/analytics/package)
- [@vercel/analytics Server API](https://vercel.com/docs/analytics/package#server-side-tracking)

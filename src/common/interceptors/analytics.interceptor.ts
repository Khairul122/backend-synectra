import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { track } from '@vercel/analytics/server';

/**
 * Analytics Interceptor
 *
 * Tracks API endpoint usage using Vercel Web Analytics server-side tracking.
 * This interceptor automatically logs each API request with relevant metadata.
 */
@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AnalyticsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, route } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          // Only track in production to avoid unnecessary API calls
          if (process.env.NODE_ENV === 'production') {
            const duration = Date.now() - startTime;
            const response = context.switchToHttp().getResponse();

            // Track the API request with relevant metadata
            track('API Request', {
              method,
              endpoint: route?.path || url,
              statusCode: response.statusCode,
              duration,
            }).catch((error) => {
              // Log errors but don't fail the request
              this.logger.warn(`Failed to track analytics: ${error.message}`);
            });
          }
        },
        error: (error) => {
          // Track failed requests as well
          if (process.env.NODE_ENV === 'production') {
            const duration = Date.now() - startTime;

            track('API Error', {
              method,
              endpoint: route?.path || url,
              statusCode: error.status || 500,
              duration,
            }).catch((trackError) => {
              this.logger.warn(
                `Failed to track error analytics: ${trackError.message}`,
              );
            });
          }
        },
      }),
    );
  }
}

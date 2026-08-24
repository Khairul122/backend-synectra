import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ServicesModule } from './modules/services/services.module';
import { BannersModule } from './modules/banners/banners.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { SocialMediaModule } from './modules/social-media/social-media.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProgressReportsModule } from './modules/progress-reports/progress-reports.module';
import { ServicePackagesModule } from './modules/service-packages/service-packages.module';
import { SoftwareProductsModule } from './modules/software-products/software-products.module';
import { SoftwarePurchasesModule } from './modules/software-purchases/software-purchases.module';
import { ClientsModule } from './modules/clients/clients.module';
import { UsersModule } from './modules/users/users.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { TodosModule } from './modules/todos/todos.module';
import { SettingsModule } from './modules/settings/settings.module';
import { GithubWebhookModule } from './modules/webhooks/github-webhook.module';
import supabaseConfig from './config/supabase.config';
import jwtConfig from './config/jwt.config';
import googleAuthConfig from './config/google-auth.config';
import githubConfig from './config/github.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, jwtConfig, googleAuthConfig, githubConfig],
    }),
    // Rate limiting global: 60 request/menit per IP.
    // Catatan: storage in-memory bersifat per serverless instance (reset saat
    // cold start) — ini defense-in-depth; pertahanan utama ada di WAF Vercel.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 60 }],
    }),
    AuthModule,
    PortfolioModule,
    ServicesModule,
    BannersModule,
    BankAccountsModule,
    SocialMediaModule,
    ContactsModule,
    OrdersModule,
    PaymentsModule,
    ProgressReportsModule,
    ServicePackagesModule,
    SoftwareProductsModule,
    SoftwarePurchasesModule,
    ClientsModule,
    UsersModule,
    FeedbacksModule,
    TodosModule,
    SettingsModule,
    GithubWebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

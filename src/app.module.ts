import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
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
import supabaseConfig from './config/supabase.config';
import jwtConfig from './config/jwt.config';
import googleAuthConfig from './config/google-auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, jwtConfig, googleAuthConfig],
    }),
    AuthModule,
    PortfolioModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

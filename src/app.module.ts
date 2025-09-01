// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

// --- Import Config Files ---
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// --- Modules ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module'; // เพิ่ม
import { ProductsModule } from './modules/products/products.module'; // เพิ่ม
import { CategoriesModule } from './modules/categories/categories.module'; // เพิ่ม
import { OrdersModule } from './modules/orders/orders.module'; // เพิ่ม
import { PaymentsModule } from './modules/payments/payments.module'; // เพิ่ม
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { PromotionsModule } from './modules/promotions/promotions.module'; // เพิ่ม
import { UploadsModule } from './uploads/uploads.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './modules/mail/mail.module';
import { DashboardModule } from './modules/dashboard/dashboard.module'; // เพิ่ม

@Module({
  imports: [
    // 1. Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (config) => config,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),

    // 2. Feature Modules
    AdminModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    CartModule,
    PromotionsModule,
    DashboardModule,
    
    // 3. Shared/Helper Modules
    UploadsModule,
    RedisModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
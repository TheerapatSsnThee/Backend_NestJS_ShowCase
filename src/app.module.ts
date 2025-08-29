import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- 🛠️ เพิ่ม ConfigService ที่นี่
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

// --- Import Config Files ---
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config'; // <-- 🛠️ แก้ไขชื่อไฟล์

// --- Modules ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { UploadsModule } from './uploads/uploads.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './modules/mail/mail.module';

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
    ReviewsModule,
    CartModule,
    
    // 3. Shared/Helper Modules
    UploadsModule,
    RedisModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
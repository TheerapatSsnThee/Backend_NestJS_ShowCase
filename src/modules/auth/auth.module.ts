import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // เพิ่มบรรทัดนี้
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport'; // <-- เพิ่ม
import { JwtModule } from '@nestjs/jwt';          // <-- เพิ่ม
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- เพิ่ม
import { JwtStrategy } from './jwt.strategy'; // <-- เพิ่ม

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({ // <-- ตั้งค่า JWT Module
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- เพิ่ม JwtStrategy ที่นี่
})
export class AuthModule {}
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // --- แก้ไข: ระบุ Type เป็น NestExpressApplication ---
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // --- แก้ไข: เปลี่ยนมาใช้ app.useStaticAssets ซึ่งเป็นวิธีของ NestJS โดยตรง ---
  // ส่วนนี้จะทำให้ Server สามารถส่งไฟล์รูปภาพในโฟลเดอร์ 'uploads' ออกไปได้
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL ที่จะใช้เข้าถึงรูปภาพคือ http://localhost:3001/uploads/ชื่อไฟล์
  });

  // เปิดใช้งาน CORS เพื่อให้ Frontend เรียก API ได้
  app.enableCors();

  // ตั้งค่าให้ ValidationPipe ทำงานทั่วทั้งแอปพลิเคชัน
  // ทำให้ DTO ที่มี class-validator ทำงานได้อัตโนมัติ
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
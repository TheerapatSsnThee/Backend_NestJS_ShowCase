import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // เปิดใช้งาน CORS เพื่อให้ Frontend เรียก API ได้
  app.enableCors();

  // ตั้งค่าให้ ValidationPipe ทำงานทั่วทั้งแอปพลิเคชัน
  // ทำให้ DTO ที่มี class-validator ทำงานได้อัตโนมัติ
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
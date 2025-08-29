import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [RedisModule], // Import RedisModule เพื่อให้ Service ใช้ Client ได้
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersAdminController } from './orders.admin.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { CartModule } from '../cart/cart.module';
import { RedisModule } from '../../redis/redis.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { CartService } from '../cart/cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      ProductVariant,
      User,
    ]),
    CartModule,
    RedisModule,
    PromotionsModule,
  ],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService, CartService],
})
export class OrdersModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity'; // Import ที่นี่ด้วย

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order])], // ต้อง import Order ด้วย
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
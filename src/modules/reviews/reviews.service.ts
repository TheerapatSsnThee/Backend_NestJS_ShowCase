import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order } from '../orders/entities/order.entity'; // ต้อง Import Order Entity

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Order) // Inject OrderRepository เพื่อใช้ตรวจสอบ
    private ordersRepository: Repository<Order>,
  ) {}

  async create(
    productId: number,
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    // ตรวจสอบว่าผู้ใช้เคยซื้อสินค้านี้หรือไม่
    const hasPurchased = await this.ordersRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'order_item')
      .where('order.user_id = :userId', { userId })
      .andWhere('order.status = :status', { status: 'delivered' }) // เช็คเฉพาะสถานะ "ส่งแล้ว"
      .andWhere('order_item.product_id = :productId', { productId })
      .getExists();

    if (!hasPurchased) {
      throw new ForbiddenException(
        'You can only review products you have purchased and received.',
      );
    }

    const newReview = this.reviewsRepository.create({
      ...createReviewDto,
      product_id: productId,
      user_id: userId,
    });

    return this.reviewsRepository.save(newReview);
  }

  async findByProduct(productId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { product_id: productId },
      order: { created_at: 'DESC' },
    });
  }
}
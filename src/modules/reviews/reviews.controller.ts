import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products/:productId/reviews') // Endpoint จะเป็นแบบซ้อนกัน
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Endpoint นี้สำหรับให้ลูกค้าสร้างรีวิว ต้อง Login ก่อน
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req, // เพื่อเอา userId
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const userId = req.user.id;
    return this.reviewsService.create(productId, userId, createReviewDto);
  }

  // Endpoint นี้สำหรับให้ทุกคนดูรีวิวของสินค้าได้
  @Get()
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }
}
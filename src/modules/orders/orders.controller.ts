import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto'; // <-- 1. Import DTO

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(
    @Request() req,
    @Body() checkoutDto: CheckoutDto, // <-- 2. รับ Body ที่มี promotionCode
  ) {
    const userId = req.user.id;
    // 3. ส่ง promotionCode ไปให้ Service
    return this.ordersService.createOrderFromCart(
      userId,
      checkoutDto.promotionCode,
    );
  }

  @Get()
  findUserOrders(@Request() req) {
    const userId = req.user.id;
    return this.ordersService.findUserOrders(userId);
  }
}
import { Controller, Post, Get, UseGuards, Request, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(
    @Request() req,
    @Body() checkoutDto: CheckoutDto,
  ) {
    const userId = req.user.id;
    return this.ordersService.createOrderFromCart(userId, checkoutDto);
  }

  @Get()
  findUserOrders(@Request() req) {
    const userId = req.user.id;
    return this.ordersService.findUserOrders(userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
      const userId = req.user.id;
      return this.ordersService.findOne(id, userId);
  }
}
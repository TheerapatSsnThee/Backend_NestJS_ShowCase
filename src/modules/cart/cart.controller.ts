import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@Request() req, @Body() addItemDto: AddItemDto) {
    const userId = req.user.id;
    return this.cartService.addItem(userId, addItemDto);
  }

  // itemKey จะอยู่ในรูปแบบ "productId:variantId" เช่น "101:5"
  @Delete('items/:itemKey')
  removeItem(@Request() req, @Param('itemKey') itemKey: string) {
    const userId = req.user.id;
    return this.cartService.removeItem(userId, itemKey);
  }

  @Delete()
  clearCart(@Request() req) {
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }
}
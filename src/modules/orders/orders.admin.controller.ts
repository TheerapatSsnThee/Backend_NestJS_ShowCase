import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';


@UseGuards(JwtAuthGuard, RolesGuard) // ป้องกันทุก Route ใน Controller นี้
@Controller('admin/orders')
export class OrdersAdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF) // อนุญาตให้ ADMIN และ STAFF เข้าถึง
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll({ page, limit, status });
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }
}
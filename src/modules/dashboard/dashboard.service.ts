import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getStats() {
    // 1. คำนวณยอดขายรวม (เฉพาะออเดอร์ที่จ่ายเงินแล้ว)
    const totalSalesResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'totalSales')
      .where('order.status = :status', { status: OrderStatus.PAID })
      .getRawOne();
    const totalSales = parseFloat(totalSalesResult.totalSales) || 0;

    // 2. นับจำนวนออเดอร์ทั้งหมด
    const totalOrders = await this.ordersRepository.count();

    // 3. นับจำนวนผู้ใช้ใหม่ใน 30 วันที่ผ่านมา
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();
      
    // 4. ดึง 5 ออเดอร์ล่าสุด
    const recentOrders = await this.ordersRepository.find({
        order: { created_at: 'DESC' },
        take: 5,
        relations: ['user']
    });

    return {
      totalSales,
      totalOrders,
      newUsers,
      recentOrders: recentOrders.map(({user: {password_hash, ...user}, ...order}) => ({...order, user}))
    };
  }
}
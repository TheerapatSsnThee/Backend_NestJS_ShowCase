import { Module } from '@nestjs/common';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { ProductsModule } from '../modules/products/products.module';
import { PromotionsModule } from '../modules/promotions/promotions.module';
import { UsersModule } from '../modules/users/users.module';
import { CategoriesModule } from '../modules/categories/categories.module';

@Module({
  imports: [
    DashboardModule,
    OrdersModule,
    PaymentsModule,
    ProductsModule,
    PromotionsModule,
    UsersModule,
    CategoriesModule,
  ],
})
export class AdminModule {}
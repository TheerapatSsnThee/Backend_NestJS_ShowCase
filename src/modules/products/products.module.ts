import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity'; // 🔥 เพิ่ม
import { ProductsAdminController } from './products.admin.controller';
import { UploadsModule } from '../../uploads/uploads.module'; // 🔥 เพิ่ม

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage]), // 🔥 เพิ่ม ProductImage
    UploadsModule, // 🔥 เพิ่ม UploadsModule
  ],
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService],
})
export class ProductsModule {}

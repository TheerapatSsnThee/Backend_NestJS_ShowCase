// src/modules/products/products.admin.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors, // 🔥 เพิ่ม
  UploadedFiles,    // 🔥 เพิ่ม
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express'; // 🔥 เพิ่ม
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('admin/products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images')) // 🔥 เพิ่ม
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[], // 🔥 เพิ่ม
  ) {
    return this.productsService.create(createProductDto, images); // 🔥 แก้ไข
  }

  // ... (โค้ดส่วนที่เหลือเหมือนเดิม) ...
  @Get()
  findAll() {
    return this.productsService.findAll({ page: 1, limit: 1000 });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}

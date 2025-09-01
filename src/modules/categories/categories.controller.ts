// src/modules/categories/categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard'; // 1. เปิด import
import { Roles } from '../../common/decorators/roles.decorator'; // 2. เปิด import
import { UserRole } from '../users/entities/user.entity';     // 3. เปิด import

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 🔐 ใช้ Guard 2 ชั้น: 1. ต้อง Login, 2. ต้องมี Role เป็น Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // 4. ระบุว่าต้องมี Role เป็น ADMIN เท่านั้น
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // Endpoint นี้ให้ทุกคนดูได้ ไม่ต้องป้องกัน
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // Endpoint นี้ให้ทุกคนดูได้ ไม่ต้องป้องกัน
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  // 🔐 ป้องกัน Endpoint สำหรับ Update
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // 🔐 ป้องกัน Endpoint สำหรับ Delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
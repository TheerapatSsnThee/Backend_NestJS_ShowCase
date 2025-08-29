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
// import { RolesGuard } from '../common/guards/roles.guard'; // หากต้องการใช้ RolesGuard
// import { Roles } from '../common/decorators/roles.decorator'; // หากต้องการใช้ RolesGuard
// import { UserRole } from '../users/entities/user.entity'; // หากต้องการใช้ RolesGuard

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Endpoint นี้ป้องกันโดย Guard เพื่อให้เฉพาะ Admin สร้างได้
  @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.ADMIN) // หากต้องการระบุว่าเป็น Admin เท่านั้น
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

  @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
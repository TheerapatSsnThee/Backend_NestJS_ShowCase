import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsService } from './promotions.service';
import { PromotionsAdminController } from './promotions.admin.controller';
import { Promotion } from './entities/promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  controllers: [PromotionsAdminController],
  providers: [PromotionsService],
  exports: [PromotionsService], // Export เพื่อให้ Service อื่นเรียกใช้ได้
})
export class PromotionsModule {}
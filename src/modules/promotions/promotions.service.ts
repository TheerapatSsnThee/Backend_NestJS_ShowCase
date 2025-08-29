import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionType } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  //--- Admin Functions ---
  create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const promo = this.promotionsRepository.create(createPromotionDto);
    return this.promotionsRepository.save(promo);
  }

  findAll(): Promise<Promotion[]> {
    return this.promotionsRepository.find();
  }

  //--- User-Facing Function ---
  async applyPromotion(code: string, currentTotal: number): Promise<{ discount: number, finalTotal: number }> {
    const promo = await this.promotionsRepository.findOneBy({ code, is_active: true });

    if (!promo) {
      throw new NotFoundException('Invalid or inactive promotion code.');
    }

    const now = new Date();
    if ((promo.start_date && now < promo.start_date) || (promo.end_date && now > promo.end_date)) {
        throw new BadRequestException('Promotion is not valid at this time.');
    }

    let discount = 0;
    if (promo.type === PromotionType.FIXED) {
      discount = promo.value;
    } else if (promo.type === PromotionType.PERCENTAGE) {
      discount = currentTotal * (promo.value / 100);
    }

    const finalTotal = Math.max(0, currentTotal - discount);

    return {
      discount: parseFloat(discount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
    };
  }
}
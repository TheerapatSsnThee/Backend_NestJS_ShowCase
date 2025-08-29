import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { PromotionType } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PromotionType)
  type: PromotionType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  start_date?: Date;

  @IsDateString()
  @IsOptional()
  end_date?: Date;
}
import { IsString, IsOptional } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsOptional()
  promotionCode?: string;
}
import { IsInt, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class AddItemDto {
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsInt()
  @IsOptional()
  variant_id?: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock_quantity: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  category_id: number;
  
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; 
      }
    }
    return value;
  })
  variants?: CreateVariantDto[];

  @IsOptional()
  images?: any[];
}

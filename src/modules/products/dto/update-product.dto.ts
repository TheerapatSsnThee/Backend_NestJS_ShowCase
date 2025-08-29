import {
  IsString,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateVariantDto {
  @IsOptional()
  @IsInt()
  id?: number; // ID สำหรับระบุ variant ที่จะอัปเดต

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  category_id?: number;

  // การอัปเดต variant จะซับซ้อนกว่านี้ สามารถเพิ่มเติม Logic ได้ในอนาคต
  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => UpdateVariantDto)
  // variants?: UpdateVariantDto[];
}
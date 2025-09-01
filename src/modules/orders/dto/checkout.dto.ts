import { IsString, IsOptional, IsNotEmpty, Length, Matches } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsOptional()
  promotionCode?: string;

  @IsString()
  @IsNotEmpty()
  shipping_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'เบอร์โทรศัพท์ต้องมี 10 หลัก' })
  @Matches(/^[0-9]+$/, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น' })
  shipping_phone: string;

  @IsString()
  @IsNotEmpty()
  shipping_address_line1: string;

  @IsString()
  @IsNotEmpty()
  shipping_subdistrict: string;

  @IsString()
  @IsNotEmpty()
  shipping_district: string;
  
  @IsString()
  @IsNotEmpty()
  shipping_province: string;

  @IsString()
  @IsNotEmpty()
  shipping_postal_code: string;
}
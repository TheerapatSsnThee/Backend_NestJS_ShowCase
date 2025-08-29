import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  private getCartKey(userId: number): string {
    return `cart:${userId}`;
  }

  async addItem(userId: number, addItemDto: AddItemDto): Promise<void> {
    const { product_id, variant_id, quantity } = addItemDto;
    const cartKey = this.getCartKey(userId);
    const itemKey = `${product_id}:${variant_id || 0}`; // ใช้ 0 ถ้าไม่มี variant

    // เพิ่มสินค้าเข้าไปใน Hash ของตะกร้า โดยใช้ hincrby เพื่อเพิ่มจำนวน
    await this.redisClient.hincrby(cartKey, itemKey, quantity);
  }

  async getCart(userId: number): Promise<any> {
    const cartKey = this.getCartKey(userId);
    const cartItems = await this.redisClient.hgetall(cartKey);

    // แปลงผลลัพธ์จาก Redis ให้อยู่ในรูปแบบที่ใช้งานง่าย
    return Object.entries(cartItems).map(([itemKey, quantity]) => {
      const [product_id, variant_id] = itemKey.split(':');
      return {
        product_id: parseInt(product_id, 10),
        variant_id: parseInt(variant_id, 10) || null,
        quantity: parseInt(quantity, 10),
      };
    });
  }

  async removeItem(userId: number, itemKey: string): Promise<void> {
    const cartKey = this.getCartKey(userId);
    await this.redisClient.hdel(cartKey, itemKey);
  }

  async clearCart(userId: number): Promise<void> {
    const cartKey = this.getCartKey(userId);
    await this.redisClient.del(cartKey);
  }
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  product_id: number;
  
  // --- 🛠️ ตรวจสอบว่ามี @Column() ถูกต้อง ---
  @Column({ type: 'int', nullable: true })
  variant_id: number | null;
  // --- สิ้นสุดส่วนที่ต้องตรวจสอบ ---

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_at_purchase: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
  
  @ManyToOne(() => ProductVariant, { nullable: true, eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
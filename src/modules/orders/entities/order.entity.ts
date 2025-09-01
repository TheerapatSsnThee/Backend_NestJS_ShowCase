import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  // --- ส่วนที่แก้ไข ---
  @Column({ length: 255 })
  shipping_name: string;

  @Column({ length: 10 })
  shipping_phone: string;

  @Column({ type: 'text' })
  shipping_address_line1: string; // (บ้านเลขที่, หมู่, ถนน)

  @Column({ length: 100 })
  shipping_subdistrict: string; // (ตำบล/แขวง)
  
  @Column({ length: 100 })
  shipping_district: string; // (อำเภอ/เขต)

  @Column({ length: 100 })
  shipping_province: string; // (จังหวัด)

  @Column({ length: 10 })
  shipping_postal_code: string;
  // --- สิ้นสุดส่วนที่แก้ไข ---

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
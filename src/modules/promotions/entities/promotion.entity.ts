import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PromotionType {
  FIXED = 'fixed', // ลดราคาแบบจำนวนเงินคงที่
  PERCENTAGE = 'percentage', // ลดราคาแบบเปอร์เซ็นต์
}

@Entity({ name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // โค้ดส่วนลด เช่น 'SALE10'

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // ค่าของส่วนลด (เช่น 100.00 หรือ 10.00 สำหรับ 10%)

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
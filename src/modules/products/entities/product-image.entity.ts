        import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
        import { Product } from './product.entity';

        @Entity({ name: 'product_images' })
        export class ProductImage {
          @PrimaryGeneratedColumn()
          id: number;

          @Column()
          product_id: number;

          @Column({ type: 'varchar', length: 2048 })
          url: string;

          @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
          @JoinColumn({ name: 'product_id' })
          product: Product;
        }
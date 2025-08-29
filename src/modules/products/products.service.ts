// src/modules/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileUploadService } from '../../uploads/uploads.service'; // 🔥 เพิ่ม
import { ProductImage } from './entities/product-image.entity'; // 🔥 เพิ่ม

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
    private dataSource: DataSource,
    private fileUploadService: FileUploadService, // 🔥 เพิ่ม
  ) {}

private slugify(text: string): string {
    // ... (โค้ดเดิม) ...
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return (
      text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') +
      '-' +
      timestamp +
      randomStr
    );
  }

  async create(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[], // 🔥 เพิ่ม
  ): Promise<Product> {
    const { variants, ...productData } = createProductDto;
    const slug = this.slugify(productData.title);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newProduct = queryRunner.manager.create(Product, {
        ...productData,
        slug,
      });
      const savedProduct = await queryRunner.manager.save(newProduct);

      if (images && images.length > 0) {
        const imageUrls = await Promise.all(
            images.map(file => this.fileUploadService.uploadFile(file))
        );
        const imageEntities = imageUrls.map(url => 
            queryRunner.manager.create(ProductImage, {
                product_id: savedProduct.id,
                url: url,
            })
        );
        await queryRunner.manager.save(imageEntities);
      }

      if (variants && variants.length > 0) {
        const variantEntities = variants.map((v) =>
          queryRunner.manager.create(ProductVariant, {
            ...v,
            product_id: savedProduct.id,
          }),
        );
        await queryRunner.manager.save(variantEntities);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(options: { page: number; limit: number }): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['category', 'variants'],
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['variants', 'category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
    
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['variants', 'category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  // --- 🛠️ จุดที่ 2: เพิ่มฟังก์ชัน update() สำหรับ Admin ---
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productsRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (updateProductDto.title) {
      product.slug = this.slugify(updateProductDto.title);
    }
    return this.productsRepository.save(product);
  }

  // --- 🛠️ จุดที่ 3: เพิ่มฟังก์ชัน remove() สำหรับ Admin ---
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id); // ใช้ findOne เพื่อเช็คว่ามีสินค้าจริงหรือไม่
    await this.productsRepository.remove(product);
    return { message: 'Product removed successfully' };
  }
}
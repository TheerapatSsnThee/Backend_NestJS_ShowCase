// src/modules/products/products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileUploadService } from '../../uploads/uploads.service';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
    private dataSource: DataSource,
    private fileUploadService: FileUploadService,
  ) {}

  private slugify(text: string): string {
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
    images: Express.Multer.File[],
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
      relations: ['category', 'variants', 'images'],
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['variants', 'category', 'images'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

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

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return { message: 'Product removed successfully' };
  }

  async addImage(productId: number, imageFile: Express.Multer.File): Promise<ProductImage> {
    const product = await this.findOne(productId);
    if (!imageFile) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = await this.fileUploadService.uploadFile(imageFile);

    const newImage = new ProductImage();
    newImage.product_id = product.id;
    newImage.url = imageUrl;

    const imageRepository = this.dataSource.getRepository(ProductImage);
    return imageRepository.save(newImage);
  }

  async removeImage(imageId: number): Promise<{ message: string }> {
    const imageRepository = this.dataSource.getRepository(ProductImage);
    const result = await imageRepository.delete(imageId);

    if (result.affected === 0) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }
    return { message: 'Image removed successfully' };
  }
}
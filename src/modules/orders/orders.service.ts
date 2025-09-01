import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { CartService } from '../cart/cart.service';
import { PromotionsService } from '../promotions/promotions.service';
import { User } from '../users/entities/user.entity';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private cartService: CartService,
    private promotionsService: PromotionsService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  async createOrderFromCart(
    userId: number,
    checkoutDto: CheckoutDto,
  ): Promise<Order> {
    const { 
        promotionCode, 
        shipping_name, 
        shipping_phone, 
        shipping_address_line1,
        shipping_subdistrict,
        shipping_district,
        shipping_province,
        shipping_postal_code
    } = checkoutDto;
    
    // --- เพิ่มส่วนที่ขาดหายไป ---
    const cartItems = await this.cartService.getCart(userId);
    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }
    // --- สิ้นสุดส่วนที่เพิ่ม ---

    const productIds = cartItems.map((item) => item.product_id);
    const variantIds = cartItems
      .map((item) => item.variant_id)
      .filter((id) => id);
      
    const productsInCart = await this.productsRepository.findBy({
      id: In(productIds),
    });
    const variantsInCart = await this.variantsRepository.findBy({
      id: In(variantIds),
    });

    const productMap = new Map(productsInCart.map((p) => [p.id, p]));
    const variantMap = new Map(variantsInCart.map((v) => [v.id, v]));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subTotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of cartItems) {
        const product = productMap.get(item.product_id);
        const variant = item.variant_id ? variantMap.get(item.variant_id) : null;
        if (!product)
          throw new NotFoundException(`Product ID ${item.product_id} not found`);

        const stockEntity = variant || product;
        if (stockEntity.stock_quantity < item.quantity) {
          throw new ConflictException(`Not enough stock for product: ${product.title}`);
        }
        stockEntity.stock_quantity -= item.quantity;
        await queryRunner.manager.save(variant ? ProductVariant : Product, stockEntity);

        const price = Number(product.price);
        subTotal += price * item.quantity;
        orderItems.push(
          queryRunner.manager.create(OrderItem, {
            ...item,
            price_at_purchase: price,
          }),
        );
      }

      let finalTotal = subTotal;
      let discount = 0;
      if (promotionCode) {
        const promoResult = await this.promotionsService.applyPromotion(
          promotionCode,
          subTotal,
        );
        finalTotal = promoResult.finalTotal;
        discount = promoResult.discount;
      }

      const newOrder = this.ordersRepository.create({
        user_id: userId,
        total_amount: finalTotal,
        discount_amount: discount,
        status: OrderStatus.PENDING,
        items: orderItems,
        shipping_name,
        shipping_phone,
        shipping_address_line1,
        shipping_subdistrict,
        shipping_district,
        shipping_province,
        shipping_postal_code,
      });

      const savedOrder = await queryRunner.manager.save(newOrder);
      await this.cartService.clearCart(userId);
      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id, userId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      relations: ['items', 'items.product', 'items.product.images'],
    });
  }

  async findOne(id: number, userId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: id, user_id: userId },
      relations: ['items', 'items.product', 'items.product.images', 'user'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async cancelOrder(orderId: number, userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId, user_id: userId },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found.`);
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAID) {
        throw new BadRequestException(`Cannot cancel an order with status: ${order.status}`);
      }

      for (const item of order.items) {
        if (item.variant_id) {
          await queryRunner.manager.increment(ProductVariant, { id: item.variant_id }, 'stock_quantity', item.quantity);
        } else {
          await queryRunner.manager.increment(Product, { id: item.product_id }, 'stock_quantity', item.quantity);
        }
      }

      order.status = OrderStatus.CANCELLED;
      const cancelledOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return cancelledOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options: { page: number; limit: number; status?: OrderStatus }): Promise<any> {
    const { page, limit, status } = options;
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.first_name', 'user.last_name', 'user.email'])
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
      
    if (status) {
      query.where('order.status = :status', { status });
    }
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    order.status = status;
    return this.ordersRepository.save(order);
  }

  async findOneForAdmin(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'items.product.images', 'user', 'payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.user) {
      const { password_hash, ...user } = order.user;
      order.user = user as User;
    }
    
    return order;
  }
}
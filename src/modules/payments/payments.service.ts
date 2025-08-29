import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FileUploadService } from '../../uploads/uploads.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private fileUploadService: FileUploadService,
    private dataSource: DataSource,
  ) {}

  //--- User-Facing Function ---

  async submitQrSlip(
    orderId: number,
    userId: number,
    slipFile: Express.Multer.File,
  ): Promise<Payment> {
    const order = await this.ordersRepository.findOneBy({
      id: orderId,
      user_id: userId,
    });
    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this user.`,
      );
    }

    const slipUrl = await this.fileUploadService.uploadFile(slipFile);

    const newPayment = this.paymentsRepository.create({
      order_id: orderId,
      amount: order.total_amount,
      method: PaymentMethod.QR_TRANSFER,
      status: PaymentStatus.PENDING, // ถูกต้องแล้วที่ให้เป็น PENDING
      slip_url: slipUrl,
    });

    return this.paymentsRepository.save(newPayment);
  }

  //--- Admin Functions ---

  /**
   * ค้นหาการชำระเงินที่รอการยืนยันทั้งหมด
   */
  async findPendingPayments(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        method: PaymentMethod.QR_TRANSFER,
      },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * ยืนยันการชำระเงินโดย Admin
   * @param paymentId ID ของการชำระเงิน
   */
  async confirmPayment(paymentId: number): Promise<{ message: string }> {
    // ใช้ Transaction เพื่อให้แน่ใจว่าการอัปเดตทั้ง 2 ตารางจะสำเร็จพร้อมกัน
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOneBy(Payment, {
        id: paymentId,
      });
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found.`);
      }
      if (payment.status === PaymentStatus.CONFIRMED) {
        throw new ConflictException('This payment has already been confirmed.');
      }

      const order = await queryRunner.manager.findOneBy(Order, {
        id: payment.order_id,
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${payment.order_id} not found.`);
      }

      // 1. อัปเดตสถานะ Payment
      payment.status = PaymentStatus.CONFIRMED;
      await queryRunner.manager.save(payment);

      // 2. อัปเดตสถานะ Order
      order.status = OrderStatus.PAID;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return { message: 'Payment confirmed successfully.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
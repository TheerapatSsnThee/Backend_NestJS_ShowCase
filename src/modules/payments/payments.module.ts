import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { UploadsModule } from '../../uploads/uploads.module';
import { PaymentsAdminController } from './payments.admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    UploadsModule, // Import เพื่อให้ใช้ FileUploadService ได้
  ],
  controllers: [PaymentsController, PaymentsAdminController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
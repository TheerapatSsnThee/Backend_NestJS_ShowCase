import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF) // อนุญาตเฉพาะ ADMIN และ STAFF
@Controller('admin/payments')
export class PaymentsAdminController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('pending-verification')
  findPending() {
    return this.paymentsService.findPendingPayments();
  }

  @Post(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.confirmPayment(id);
  }
}
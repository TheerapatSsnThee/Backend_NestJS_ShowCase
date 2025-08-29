import { Controller, Post, Param, ParseIntPipe, UploadedFile, UseInterceptors, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/qr-slip')
  @UseInterceptors(FileInterceptor('slip')) // 'slip' คือชื่อ field ใน form-data
  submitQrSlip(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Request() req,
    @UploadedFile() slipFile: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.paymentsService.submitQrSlip(orderId, userId, slipFile);
  }
}
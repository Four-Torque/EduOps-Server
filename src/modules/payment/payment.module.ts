import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { PaymentRepository } from './repository/payment.repository';
import { StudentModule } from '../student/student.module';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [StudentModule, ClassModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}

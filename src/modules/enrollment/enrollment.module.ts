import { Module } from '@nestjs/common';
import { EnrollmentController } from './controller/enrollment.controller';
import { EnrollmentService } from './service/enrollment.service';
import { EnrollmentRepository } from './repository/enrollment.repository';
import { PaymentModule } from '../payment/payment.module';
import { ClassModule } from '../class/class.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [PaymentModule, ClassModule, StudentModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentRepository],
  exports: [EnrollmentService, EnrollmentRepository],
})
export class EnrollmentModule {}

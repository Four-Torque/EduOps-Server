import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GlobalModule } from './global/global.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RequestMiddleware } from './global';
import { UserModule } from './modules/user/user.module';
import { SalaryModule } from './modules/salary/salary.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffAttendanceModule } from './modules/attendance/attendance.module';
import { JwtGuard } from './modules/auth/guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { StudentModule } from './modules/student/student.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { ExamModule } from './modules/exam/exam.module';
import { ClassFileModule } from './modules/class-file/class-file.module';
import { ClassModule } from './modules/class/class.module';
import { CategoryModule } from './modules/category/category.module';
import { PaymentModule } from './modules/payment/payment.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { AssetModule } from './modules/asset/asset.module';
import { ClassSyllabusModule } from './modules/class-syllabus/class-syllabus.module';
import { MessageModule } from './modules/message/message.module';
import { AcademyModule } from './modules/academy/academy.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SubjectModule } from './modules/subject/subject.module';

@Module({
  imports: [
    GlobalModule,
    RedisModule,
    PrismaModule,
    UserModule,
    SalaryModule,
    AuthModule,
    StaffAttendanceModule,
    AssetModule,
    StudentModule,
    VendorModule,
    ExamModule,
    ClassFileModule,
    ClassModule,
    CategoryModule,
    PaymentModule,
    EnrollmentModule,
    ScheduleModule,
    NestScheduleModule.forRoot(),
    ClassSyllabusModule,
    MessageModule,
    AcademyModule,
    FinanceModule,
    SubjectModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

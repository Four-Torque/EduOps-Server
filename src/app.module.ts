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
import { ClassModule } from './modules/class/class.module';

@Module({
  imports: [
    GlobalModule,
    RedisModule,
    PrismaModule,
    UserModule,
    SalaryModule,
    AuthModule,
    StaffAttendanceModule,
    StudentModule,
    VendorModule,
    ClassModule,
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

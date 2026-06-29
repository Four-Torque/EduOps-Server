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

@Module({
  imports: [
    GlobalModule,
    RedisModule,
    PrismaModule,
    UserModule,
    SalaryModule,
    AuthModule,
    StaffAttendanceModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

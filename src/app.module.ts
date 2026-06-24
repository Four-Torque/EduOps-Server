import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GlobalModule } from './global/global.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RequestMiddleware } from './global/middlewares/logger.middleware';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [GlobalModule, RedisModule, PrismaModule, UserModule],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

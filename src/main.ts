import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {
  ApiInterceptor,
  CLIENT_URL,
  HttpExceptionFilter,
  PORT,
  winstonLogger,
} from './global';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
    bufferLogs: true,
  });
  app.use(cookieParser());
  app.enableCors({
    origin: [CLIENT_URL],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter(winstonLogger));
  app.useGlobalInterceptors(new ApiInterceptor(reflector));
  await app.listen(PORT);
}
bootstrap();

import { HttpModule } from '@nestjs/axios';
import { Global, Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  imports: [HttpModule],
  providers: [JwtService, Logger],
  exports: [JwtService, Logger, HttpModule],
})
export class GlobalModule {}

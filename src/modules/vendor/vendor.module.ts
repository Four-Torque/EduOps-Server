import { Module } from '@nestjs/common';
import { VendorService } from './service/vendor.service';
import { VendorController } from './controller/vendor.controller';

@Module({
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}

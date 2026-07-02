import { Module } from '@nestjs/common';
import { VendorService } from './service/vendor.service';
import { VendorController } from './controller/vendor.controller';
import { VendorRepository } from './repository/vendor.repository';

@Module({
  controllers: [VendorController],
  providers: [VendorService, VendorRepository],
})
export class VendorModule {}

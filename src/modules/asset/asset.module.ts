import { Module } from '@nestjs/common';
import { AssetService } from './service/asset.service';
import { AssetController } from './controller/asset.controller';
import { AssetRepository } from './repository/asset.repository';
import { AssetApplicationController } from './controller/asset-application.controller';
import { AssetApplicationService } from './service/asset-application.service';
import { AssetApplicationRepository } from './repository/asset-application.repository';
import { CategoryModule } from '../category/category.module';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [CategoryModule, VendorModule],
  controllers: [AssetController, AssetApplicationController],
  providers: [
    AssetService,
    AssetRepository,
    AssetApplicationService,
    AssetApplicationRepository,
  ],
  exports: [
    AssetService,
    AssetRepository,
    AssetApplicationService,
    AssetApplicationRepository,
  ],
})
export class AssetModule {}

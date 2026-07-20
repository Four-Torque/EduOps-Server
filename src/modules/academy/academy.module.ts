import { Module } from '@nestjs/common';
import { AcademyService } from './service/academy.service';
import { AcademyController } from './controller/academy.controller';
import { AcademyRepository } from './repository/academy.repository';

@Module({
  controllers: [AcademyController],
  providers: [AcademyService, AcademyRepository],
  exports: [AcademyService, AcademyRepository],
})
export class AcademyModule {}

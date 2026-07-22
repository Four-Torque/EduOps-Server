import { Module } from '@nestjs/common';
import { ClassFileController } from './controller/class-file.controller';
import { ClassFileService } from './service/class-file.service';
import { ClassFileRepository } from './repository/class-file.repository';

@Module({
  imports: [],
  controllers: [ClassFileController],
  providers: [ClassFileService, ClassFileRepository],
  exports: [ClassFileService],
})
export class ClassFileModule {}

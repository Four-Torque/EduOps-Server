import { Module } from '@nestjs/common';
import { ClassController } from './controller/class.controller';
import { ClassService } from './service/class.service';
import { ClassRepository } from './repository/class.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository],
  exports: [ClassService, ClassRepository],
})
export class ClassModule {}

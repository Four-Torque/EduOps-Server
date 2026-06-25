import { Module } from '@nestjs/common';
import { UserService } from '../user/service/user.service';
import { UserController } from '../user/controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { EmailService } from '../email/service/email.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, EmailService],
  exports: [UserService, UserRepository],
})
export class UserModule {}

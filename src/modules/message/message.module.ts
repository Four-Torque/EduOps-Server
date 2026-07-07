import { Module } from '@nestjs/common';
import { MessageService } from './service/message.service';
import { MessageController } from './controller/message.controller';
import { MessageRepository } from './repository/message.repository';

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
})
export class MessageModule {}

import { Module } from '@nestjs/common';
import { MessageService } from './service/message.service';
import { MessageController } from './controller/message.controller';
import { MessageRepository } from './repository/message.repository';
import { MessageSseService } from './service/message-sse.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, MessageSseService],
  exports: [MessageSseService],
})
export class MessageModule {}

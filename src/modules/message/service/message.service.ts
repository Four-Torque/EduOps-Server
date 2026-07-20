import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import { CreateMessageRequest } from '../request/create-message.request';
import { MessageResponse } from '../response/message.response';
import { PaginatedMessageResponse } from '../response/paginated-message.response';
import { MessageFilterRequest } from '../request/message-filter.request';
import { ApiException, ErrorCode } from 'src/global';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async create(
    senderId: string,
    request: CreateMessageRequest,
  ): Promise<MessageResponse> {
    const entity = await this.messageRepository.create(
      CreateMessageRequest.toEntity(senderId, request),
    );
    const response = MessageResponse.fromEntity(entity);
    return response;
  }

  async getReceivedMessages(request: MessageFilterRequest, userId: string) {
    const { page = 1, limit } = request;

    const take = limit ?? 10;
    const skip = page && take ? (page - 1) * take : 0;
    const [messages, total] = await Promise.all([
      this.messageRepository.getReceivedMessages(take, skip, userId),
      this.messageRepository.receivedMessagesCount(take, skip, userId),
    ]);
    const response = PaginatedMessageResponse.fromEntity(page, total, messages);
    return response;
  }

  async getSentMessages(request: MessageFilterRequest, userId: string) {
    const { page = 1, limit } = request;

    const take = limit ?? 10;
    const skip = page && take ? (page - 1) * take : 0;
    const [messages, total] = await Promise.all([
      this.messageRepository.getSentMessages(take, skip, userId),
      this.messageRepository.sentMessagesCount(take, skip, userId),
    ]);
    const response = PaginatedMessageResponse.fromEntity(page, total, messages);
    return response;
  }

  async markAsRead(id: string) {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new ApiException(ErrorCode.MESSAGE_NOT_FOUND);
    }
    if (message.isRead) {
      return;
    } else {
      await this.messageRepository.updateReadStatus(
        message.receiverId,
        message.senderId,
      );
    }
  }

  async deleteMessage(id: string, type: string, userId: string) {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new ApiException(ErrorCode.MESSAGE_NOT_FOUND);
    }

    if (type === 'sender' && message.senderId === userId) {
      await this.messageRepository.delete(id, 'sender');
    }
    if (type === 'receiver' && message.receiverId === userId) {
      await this.messageRepository.delete(id, 'receiver');
    }
  }
}

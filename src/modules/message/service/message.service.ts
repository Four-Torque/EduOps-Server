import { Injectable } from '@nestjs/common';
import { MessageRepository, ConversationItem } from '../repository/message.repository';
import { CreateMessageRequest } from '../request/create-message.request';
import { MessageResponse } from '../response/message.response';
import { PaginatedMessageResponse } from '../response/paginated-message.response';
import { ConversationResponse } from '../response/conversation.response';
import { ApiException, ErrorCode } from 'src/global';
import { Transactional } from 'src/global/decorators/transactional.decorator';

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
    return MessageResponse.fromEntity(entity);
  }

  async getConversations(userId: string): Promise<ConversationResponse[]> {
    const rawConversations =
      await this.messageRepository.getConversations(userId);

    const getKoreanRoleName = (role: string) => {
      if (role === 'TEACHER') return '강사';
      if (role === 'DIRECTOR') return '원장';
      if (role === 'MANAGER') return '매니저';
      return '';
    };

    return rawConversations.map((row: ConversationItem) => ({
      otherUser: {
        id: row.userId,
        name: `${getKoreanRoleName(row.userRole)} ${row.userName}`,
        role: row.userRole,
      },
      lastMessageId: row.lastMessageId,
      lastMessageContent: row.lastMessageContent,
      lastMessageCreatedAt: row.lastMessageCreatedAt,
      unreadCount: Number(row.unreadCount),
    }));
  }

  @Transactional()
  async getConversationMessages(
    userId: string,
    otherUserId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedMessageResponse> {
    const skip = ((page || 1) - 1) * (limit || 20);
    const take = limit || 20;

    const [data, total, otherUserEntity] = await Promise.all([
      this.messageRepository.getConversationMessages(
        userId,
        otherUserId,
        skip,
        take,
      ),
      this.messageRepository.countConversationMessages(userId, otherUserId),
      this.messageRepository.findUserById(otherUserId),
    ]);

    // Auto-read messages where receiver is current user
    await this.messageRepository.updateReadStatus(userId, otherUserId);

    const getKoreanRoleName = (role: string) => {
      if (role === 'TEACHER') return '강사';
      if (role === 'DIRECTOR') return '원장';
      if (role === 'MANAGER') return '매니저';
      return '';
    };

    const mappedData = data.map((item) => {
      // Return updated isRead state for the response
      if (item.receiverId === userId && !item.isRead) {
        item.isRead = true;
        item.readAt = new Date();
      }
      return MessageResponse.fromEntity(item);
    });

    return {
      otherUser: {
        id: otherUserEntity.id,
        name: `${getKoreanRoleName(otherUserEntity.role)} ${otherUserEntity.name}`,
        role: otherUserEntity.role,
      },
      page: page || 1,
      total,
      data: mappedData,
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.messageRepository.getUnreadCountTotal(userId);
    return { count };
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const existing = await this.messageRepository.findById(messageId);
    if (!existing) {
      throw new ApiException(ErrorCode.MESSAGE_NOT_FOUND);
    }

    if (existing.senderId === userId) {
      await this.messageRepository.softDeleteSingleMessage(messageId, true);
    } else if (existing.receiverId === userId) {
      await this.messageRepository.softDeleteSingleMessage(messageId, false);
    } else {
      throw new ApiException(ErrorCode.FORBIDDEN); // Or similar, for now let's assume global FORBIDDEN exists, or just use MESSAGE_NOT_FOUND if not found for user. Let's rely on standard logic.
    }
  }

  @Transactional()
  async deleteConversation(userId: string, otherUserId: string): Promise<void> {
    await this.messageRepository.softDeleteConversation(userId, otherUserId);
  }
}

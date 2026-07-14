import { Injectable } from '@nestjs/common';
import { Prisma, Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationResponse } from '../response/conversation.response';

// export interface ConversationItem {
//   userId: string;
//   userName: string;
//   userRole: string;
//   lastMessageId: string;
//   lastMessageContent: string;
//   lastMessageCreatedAt: Date;
//   unreadCount: number;
// }

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  async findById(id: string): Promise<Message> {
    return this.prisma.message.findUnique({ where: { id } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });
  }

  async getUnreadCountTotal(userId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
        deletedByReceiver: false,
      },
    });
  }

  async getConversations(userId: string): Promise<ConversationResponse[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, deletedBySender: false },
          { receiverId: userId, deletedByReceiver: false },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    const conversationMap = new Map<string, ConversationResponse>();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? (msg as any).receiver : (msg as any).sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          otherUser:{
            id: otherUser.id,
            name: otherUser.name,
            role: otherUser.role,
          },
          lastMessageId: msg.id,
          lastMessageContent: msg.content,
          lastMessageUpdatedAt: msg.updatedAt,
          unreadCount: 0,
        });
      }
      if (msg.receiverId === userId && !msg.isRead && !msg.deletedByReceiver) {
        conversationMap.get(otherUser.id).unreadCount++;
      }
    }

    return Array.from(conversationMap.values());
  }

  async getConversationMessages(userId: string, otherUserId: string, skip?: number, take?: number): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId, deletedBySender: false },
          { senderId: otherUserId, receiverId: userId, deletedByReceiver: false },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async countConversationMessages(userId: string, otherUserId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId, deletedBySender: false },
          { senderId: otherUserId, receiverId: userId, deletedByReceiver: false },
        ],
      },
    });
  }

  async updateReadStatus(userId: string, otherUserId: string) {
    return this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
        deletedByReceiver: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async softDeleteSingleMessage(id: string, isSender: boolean) {
    return this.prisma.message.update({
      where: { id },
      data: isSender ? { deletedBySender: true } : { deletedByReceiver: true },
    });
  }

  async softDeleteConversation(userId: string, otherUserId: string) {
    await this.prisma.message.updateMany({
      where: { senderId: userId, receiverId: otherUserId, deletedBySender: false },
      data: { deletedBySender: true },
    });
    
    await this.prisma.message.updateMany({
      where: { receiverId: userId, senderId: otherUserId, deletedByReceiver: false },
      data: { deletedByReceiver: true },
    });
  }
}

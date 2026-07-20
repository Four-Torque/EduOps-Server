import { Injectable } from '@nestjs/common';
import { Prisma, Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async create(data: Prisma.MessageCreateInput): Promise<
    Message & {
      sender: { name: string; role: string };
      receiver: { name: string; role: string };
    }
  > {
    return this.prisma.message.create({
      data,
      include: {
        sender: { select: { name: true, role: true } },
        receiver: { select: { name: true, role: true } },
      },
    });
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

  async receivedMessagesCount(
    take: number,
    skip: number,
    userId: string,
  ): Promise<number> {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        deletedByReceiver: false,
      },
      take,
      skip,
    });
  }

  async getReceivedMessages(take: number, skip: number, userId: string) {
    const where: Prisma.MessageWhereInput = {
      receiverId: userId,
      deletedByReceiver: false,
    };
    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      skip,
      take,
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

  async getSentMessages(take: number, skip: number, userId: string) {
    const where: Prisma.MessageWhereInput = {
      senderId: userId,
      deletedBySender: false,
    };
    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      skip,
      take,
    });
  }

  async sentMessagesCount(
    take: number,
    skip: number,
    userId: string,
  ): Promise<number> {
    return this.prisma.message.count({
      where: {
        senderId: userId,
        deletedBySender: false,
      },
      take,
      skip,
    });
  }
  async delete(id: string, type: 'sender' | 'receiver') {
    const data =
      type === 'sender'
        ? { deletedBySender: true }
        : { deletedByReceiver: true };
    return this.prisma.message.update({
      where: { id },
      data,
    });
  }
}

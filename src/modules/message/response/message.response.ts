import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class MessageResponse {
  @ApiProperty({ description: '쪽지 고유 ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: '송신자 ID (UUID)', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  senderId: string;

  @ApiProperty({ description: '수신자 ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  receiverId: string;

  @ApiProperty({ description: '쪽지 내용', example: '좋은 아침이에요!' })
  content: string;

  @ApiProperty({ description: '읽음 여부', example: true })
  isRead: boolean;

  @ApiProperty({ description: '읽은 시간 (읽지 않았으면 null)', required: false, example: '2026-07-07T10:48:00Z', type: Date, nullable: true })
  readAt: Date | null;

  @ApiProperty({ description: '쪽지 생성 시간', example: '2026-07-07T10:42:00Z' })
  createdAt: Date;

  static fromEntity(entity: Message): MessageResponse {
    const response = new MessageResponse();
    response.id = entity.id;
    response.senderId = entity.senderId;
    response.receiverId = entity.receiverId;
    response.content = entity.content;
    response.isRead = entity.isRead;
    response.readAt = entity.readAt;
    response.createdAt = entity.createdAt;
    return response;
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class ConversationUser {
  @ApiProperty({ description: '대화 상대방 ID (UUID)', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ description: '포매팅된 대화 상대방 이름 (예: 역할 + 이름)', example: '강사 이순자' })
  name: string;

  @ApiProperty({ description: '대화 상대방의 원본 직책 (Role)', example: 'TEACHER' })
  role: string;
}

export class ConversationResponse {
  @ApiProperty({ type: ConversationUser, description: '대화 상대방 정보' })
  otherUser: ConversationUser;

  @ApiProperty({ description: '마지막으로 주고받은 쪽지 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  lastMessageId: string;

  @ApiProperty({ description: '마지막 쪽지 내용', example: '내일 아침은 비가 조금 내릴거 같습니다!' })
  lastMessageContent: string;

  @ApiProperty({ description: '마지막 쪽지 시간', example: '2026-07-07T10:48:00Z' })
  lastMessageCreatedAt: Date;

  @ApiProperty({ description: '해당 대화방의 안 읽은 쪽지 총 개수', example: 3 })
  unreadCount: number;
}

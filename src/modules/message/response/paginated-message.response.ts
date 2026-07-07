import { ApiProperty } from '@nestjs/swagger';
import { MessageResponse } from './message.response';
import { ConversationUser } from './conversation.response';

export class PaginatedMessageResponse {
  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  page: number;

  @ApiProperty({ description: '총 쪽지 개수', example: 35 })
  total: number;

  @ApiProperty({ type: [MessageResponse], description: '쪽지 목록 데이터' })
  data: MessageResponse[];

  @ApiProperty({ type: ConversationUser, description: '대화 상대방 정보' })
  otherUser: ConversationUser;
}

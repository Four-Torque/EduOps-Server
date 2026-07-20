import { ApiProperty } from '@nestjs/swagger';
import { MessageResponse } from './message.response';
import { Message } from '@prisma/client';

export class PaginatedMessageResponse {
  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  page: number;

  @ApiProperty({ description: '총 쪽지 개수', example: 35 })
  total: number;

  @ApiProperty({ description: '총 페이지 수', example: 2 })
  totalPages: number;

  @ApiProperty({ type: [MessageResponse], description: '쪽지 목록 데이터' })
  data: MessageResponse[];

  static fromEntity(
    page: number,
    total: number,
    data: (Message & {
      sender: { id: string; name: string; role: string };
      receiver: { id: string; name: string; role: string };
    })[],
  ): PaginatedMessageResponse {
    const response = new PaginatedMessageResponse();
    response.page = page;
    response.total = total;
    response.totalPages = Math.ceil(total / data.length);
    response.data = data.map((item) => MessageResponse.fromEntity(item));
    return response;
  }
}

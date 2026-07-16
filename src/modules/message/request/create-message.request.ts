import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class CreateMessageRequest {
  @ApiProperty({
    description: '수신자 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ description: '쪽지 제목', example: '출근 관련 안내' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '쪽지 내용',
    example: '좋은 아침이에요! 내일 출근하실 때 참고 부탁드립니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  static toEntity(
    senderId: string,
    request: CreateMessageRequest,
  ): Prisma.MessageCreateInput {
    return {
      title: request.title,
      content: request.content,
      sender: { connect: { id: senderId } },
      receiver: { connect: { id: request.receiverId } },
    };
  }
}

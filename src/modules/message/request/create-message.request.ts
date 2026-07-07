import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageRequest {
  @ApiProperty({ description: '수신자 ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ description: '쪽지 내용', example: '좋은 아침이에요! 내일 출근하실 때 참고 부탁드립니다.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  static toEntity(senderId: string, request: CreateMessageRequest) {
    return {
      senderId,
      receiverId: request.receiverId,
      content: request.content,
    };
  }
}

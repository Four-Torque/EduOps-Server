import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { MessageService } from '../service/message.service';
import { CreateMessageRequest } from '../request/create-message.request';
import { MessageResponse } from '../response/message.response';
import { PaginatedMessageResponse } from '../response/paginated-message.response';
import { ConversationResponse } from '../response/conversation.response';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  JwtPayload,
  Message,
  ResponseMessage,
} from 'src/global';

@ApiTags('쪽지')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({
    summary: '쪽지 전송',
    description: '특정 유저에게 쪽지를 전송합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.MESSAGE_CREATED, MessageResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.MESSAGE_CREATED)
  @Post('/')
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() request: CreateMessageRequest,
  ): Promise<MessageResponse> {
    return await this.messageService.create(user.id, request);
  }

  @ApiOperation({
    summary: '대화방 목록 조회',
    description:
      '나의 모든 대화방(채팅방) 목록과 각 방의 안 읽은 쪽지 개수, 최신 메시지를 조회합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.CONVERSATION_LIST_FETCHED,
    ConversationResponse,
    true,
  )
  @Message(ResponseMessage.CONVERSATION_LIST_FETCHED)
  @Get('/conversations')
  async getConversations(
    @CurrentUser() user: JwtPayload,
  ): Promise<ConversationResponse[]> {
    return await this.messageService.getConversations(user.id);
  }

  @ApiOperation({
    summary: '특정 유저와의 대화 상세 조회',
    description:
      '특정 유저와 나눈 대화 기록을 조회하며, 확인 시 자동으로 읽음 처리됩니다.',
  })
  @ApiSuccessResponse(ResponseMessage.MESSAGE_FETCHED, PaginatedMessageResponse)
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @Message(ResponseMessage.MESSAGE_FETCHED)
  @Get('/conversation/:userId')
  async getConversationMessages(
    @CurrentUser() user: JwtPayload,
    @Param('userId') otherUserId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedMessageResponse> {
    return await this.messageService.getConversationMessages(
      user.id,
      otherUserId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @ApiOperation({
    summary: '안 읽은 쪽지 총 개수 조회',
    description: '나를 수신자로 하는 안 읽은 쪽지의 총 개수를 반환합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.UNREAD_COUNT_FETCHED)
  @Message(ResponseMessage.UNREAD_COUNT_FETCHED)
  @Get('/unread-count')
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ count: number }> {
    return await this.messageService.getUnreadCount(user.id);
  }

  @ApiOperation({
    summary: '단건 쪽지 삭제',
    description:
      '내 채팅창에서 특정 쪽지만 지웁니다. 상대방에게는 지워지지 않습니다.',
  })
  @ApiSuccessResponse(ResponseMessage.MESSAGE_DELETED)
  @Message(ResponseMessage.MESSAGE_DELETED)
  @Patch('/:id/delete')
  async deleteMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.messageService.deleteMessage(user.id, id);
  }

  @ApiOperation({
    summary: '대화방 나가기 (전체 삭제)',
    description:
      '특정 유저와의 대화방을 나갑니다. 내 화면에서만 모든 기록이 삭제됩니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CONVERSATION_DELETED)
  @Message(ResponseMessage.CONVERSATION_DELETED)
  @Patch('/conversation/:userId/delete')
  async deleteConversation(
    @CurrentUser() user: JwtPayload,
    @Param('userId') otherUserId: string,
  ): Promise<void> {
    await this.messageService.deleteConversation(user.id, otherUserId);
  }
}

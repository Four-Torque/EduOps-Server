import { Controller, Get, Post, Body, Query, Put, Param } from '@nestjs/common';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { MessageService } from '../service/message.service';
import { CreateMessageRequest } from '../request/create-message.request';
import { MessageResponse } from '../response/message.response';
import { PaginatedMessageResponse } from '../response/paginated-message.response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  JwtPayload,
  Message,
  ResponseMessage,
} from 'src/global';
import { MessageFilterRequest } from '../request/message-filter.request';

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
    const response = await this.messageService.create(user.id, request);
    return response;
  }

  @ApiOperation({
    summary: '받은 쪽지 목록 조회',
    description:
      '내가 받은 쪽지 목록을 조회합니다. 페이지네이션이 적용되어 있으며, 기본적으로 10개씩 조회됩니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.CONVERSATION_LIST_FETCHED,
    PaginatedMessageResponse,
    true,
  )
  @Message(ResponseMessage.CONVERSATION_LIST_FETCHED)
  @Get('/received')
  async findReceivedMessages(
    @Query() request: MessageFilterRequest,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedMessageResponse> {
    const response = await this.messageService.getReceivedMessages(
      request,
      user.id,
    );
    return response;
  }

  @ApiOperation({
    summary: '보낸 쪽지 목록 조회',
    description:
      '내가 보낸 쪽지 목록을 조회합니다. 페이지네이션이 적용되어 있으며, 기본적으로 10개씩 조회됩니다.',
  })
  @Get('/sent')
  async findSentMessages(
    @Query() request: MessageFilterRequest,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedMessageResponse> {
    const response = await this.messageService.getSentMessages(
      request,
      user.id,
    );
    return response;
  }

  @ApiOperation({
    summary: '쪽지 읽음 처리',
    description: '특정 쪽지를 읽음 처리합니다.',
  })
  @ApiSuccessResponse()
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Put('/:id/read')
  async markAsRead(@Param('id') id: string): Promise<void> {
    const response = await this.messageService.markAsRead(id);
    return response;
  }
}

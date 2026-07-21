import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  Sse,
  MessageEvent,
  Delete,
} from '@nestjs/common';
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
import { MessageSseService } from '../service/message-sse.service';
import { Observable, interval, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@ApiTags('쪽지')
@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageSseService: MessageSseService,
  ) {}

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

  @ApiOperation({
    summary: '쪽지 삭제',
    description: '특정 쪽지를 삭제합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.MESSAGE_DELETED)
  @ApiErrorResponse(ErrorCode.MESSAGE_NOT_FOUND)
  @Message(ResponseMessage.MESSAGE_DELETED)
  @Delete('/')
  async deleteMessage(
    @Body('ids') ids: string[],
    @Body('type') type: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const response = await this.messageService.deleteMessage(
      ids,
      type,
      user.id,
    );
    return response;
  }

  @ApiOperation({
    summary: '실시간 쪽지 알림 SSE',
    description: '새로운 쪽지가 수신되면 이벤트를 실시간으로 전송받습니다.',
  })
  @Sse('/sse')
  sse(@CurrentUser() user: JwtPayload): Observable<MessageEvent> {
    const keepAlive$ = interval(30000).pipe(
      map(() => ({ data: 'ping' }) as MessageEvent),
    );

    const message$ = this.messageSseService.getEventStream().pipe(
      filter((msg) => msg.receiverId === user?.id),
      map((msg) => ({ data: msg }) as MessageEvent),
    );

    return merge(keepAlive$, message$);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ClassSyllabusService } from '../service/class-syllabus.service';
import { CreateClassSyllabusRequest } from '../request/create-class-syllabus.request';
import { RejectClassSyllabusRequest } from '../request/reject-class-syllabus.request';
import { ClassSyllabusResponse } from '../response/class-syllabus.response';
import { PaginatedClassSyllabusResponse } from '../response/paginated-class-syllabus.response';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';
import { Role } from 'src/global/decorators/role.decorator';
import { SyllabusStatus } from '@prisma/client';

@ApiTags('강좌계획서')
@Controller('class-syllabus')
export class ClassSyllabusController {
  constructor(private readonly classSyllabusService: ClassSyllabusService) {}

  @ApiOperation({
    summary: '강좌계획서 제출',
    description: '새로운 강좌 개설을 위한 계획서를 제출합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_SYLLABUS_CREATED, ClassSyllabusResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.CLASS_SYLLABUS_CREATED)
  @Role('TEACHER')
  @Post('/')
  async create(
    @Req() req: any,
    @Body() request: CreateClassSyllabusRequest,
  ): Promise<ClassSyllabusResponse> {
    const userId = req.user.id;
    return await this.classSyllabusService.create(userId, request);
  }

  @ApiOperation({
    summary: '강좌계획서 목록 조회',
    description: '제출된 강좌계획서 목록을 조회합니다.',
  })
  @ApiSuccessResponse(null, PaginatedClassSyllabusResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @ApiQuery({ name: 'status', required: false, enum: SyllabusStatus })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @Get('/')
  async findAll(
    @Req() req: any,
    @Query('status') status?: SyllabusStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedClassSyllabusResponse> {
    const userRole = req.user.role;
    const userId = req.user.id;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    return await this.classSyllabusService.findAll(
      userRole,
      userId,
      status,
      pageNum,
      limitNum,
    );
  }

  @ApiOperation({
    summary: '강좌계획서 상세 조회',
    description: '특정 강좌계획서의 상세 정보를 조회합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_SYLLABUS_FETCHED, ClassSyllabusResponse)
  @ApiErrorResponse(ErrorCode.CLASS_SYLLABUS_NOT_FOUND)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<ClassSyllabusResponse> {
    return await this.classSyllabusService.findById(id);
  }

  @ApiOperation({
    summary: '강좌계획서 승인',
    description: '대기 중인 강좌계획서를 승인하고 실제 강좌를 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_SYLLABUS_APPROVED, ClassSyllabusResponse)
  @ApiErrorResponse(ErrorCode.CLASS_SYLLABUS_NOT_FOUND, ErrorCode.CLASS_SYLLABUS_NOT_PENDING)
  @Message(ResponseMessage.CLASS_SYLLABUS_APPROVED)
  @Role('DIRECTOR', 'MANAGER')
  @Patch('/:id/approve')
  async approve(@Param('id') id: string): Promise<ClassSyllabusResponse> {
    return await this.classSyllabusService.approve(id);
  }

  @ApiOperation({
    summary: '강좌계획서 반려',
    description: '대기 중인 강좌계획서를 반려합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_SYLLABUS_REJECTED, ClassSyllabusResponse)
  @ApiErrorResponse(ErrorCode.CLASS_SYLLABUS_NOT_FOUND, ErrorCode.CLASS_SYLLABUS_NOT_PENDING)
  @Message(ResponseMessage.CLASS_SYLLABUS_REJECTED)
  @Role('DIRECTOR', 'MANAGER')
  @Patch('/:id/reject')
  async reject(
    @Param('id') id: string,
    @Body() request: RejectClassSyllabusRequest,
  ): Promise<ClassSyllabusResponse> {
    return await this.classSyllabusService.reject(id, request);
  }
}

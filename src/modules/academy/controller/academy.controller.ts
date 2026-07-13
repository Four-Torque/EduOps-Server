import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcademyService } from '../service/academy.service';

@ApiTags('학원 정보 관리')
@Controller('/academy')
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @ApiOperation({
    summary: '학원 정보 및 대시보드 요약 조회',
    description: '학원의 기본 정보 및 원생 관련 통계 요약을 조회합니다.',
  })
  @Get('/info')
  async getAcademyInfo() {
    const data = await this.academyService.getAcademyInfo();
    return data;
  }

  @ApiOperation({
    summary: '학원 기본 정보 수정',
    description:
      '학원의 기본 정보(이름, 대표자명, 연락처, 주소 등)를 수정합니다.',
  })
  @Put('/info')
  async updateAcademyBasicInfo(@Body() body: any) {
    const { id, createdAt, updatedAt, ...updateData } = body;
    const data = await this.academyService.updateAcademyBasicInfo(updateData);
    return data;
  }
}

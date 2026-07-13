import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AcademyRepository } from '../repository/academy.repository';

@Injectable()
export class AcademyService {
  constructor(private readonly academyRepository: AcademyRepository) {}

  async getAcademyInfo() {
    const basicInfo = await this.academyRepository.getInfo();
    const overview = await this.academyRepository.getOverview();
    return {
      basicInfo,
      overview,
    };
  }

  async updateAcademyBasicInfo(data: Prisma.AcademyInfoUpdateInput) {
    return this.academyRepository.updateInfo(data);
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AcademyRepository } from '../repository/academy.repository';
import { RedisKey, RedisService } from 'src/redis';

@Injectable()
export class AcademyService {
  constructor(
    private readonly academyRepository: AcademyRepository,
    private readonly redis: RedisService,
  ) {}

  async getAcademyInfo() {
    const key = RedisKey.academyInfo();
    return this.redis.getOrSet(
      key,
      async () => {
        const basicInfo = await this.academyRepository.getInfo();
        const overview = await this.academyRepository.getOverview();
        return {
          basicInfo,
          overview,
        };
      },
      3600,
    );
  }

  async updateAcademyBasicInfo(data: Prisma.AcademyInfoUpdateInput) {
    const updated = await this.academyRepository.updateInfo(data);
    await this.redis.del(RedisKey.academyInfo());
    return updated;
  }
}

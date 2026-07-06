import { Injectable } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AssetsApplicationCreateInput) {
    return this.prisma.assetsApplication.create({
      data,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        vendor: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findAll(take: number, skip: number, status?: string) {
    return this.prisma.assetsApplication.findMany({
      where: status ? { status: status as ApplicationStatus } : undefined,
      orderBy: {
        requestedAt: 'desc',
      },
      take,
      skip,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        vendor: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findNameAndStockByAssetName(assetNames: string[]) {
    return this.prisma.asset.findMany({
      where: {
        name: { in: assetNames },
      },
      select: {
        name: true,
        stock: true,
      },
    });
  }

  count(take: number, skip: number, status?: string): Promise<number> {
    return this.prisma.assetsApplication.count({
      where: status ? { status: status as ApplicationStatus } : undefined,
      skip,
      take,
    });
  }

  async findById(id: string) {
    return this.prisma.assetsApplication.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        vendor: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findByIds(ids: string[]) {
    console.log('findByIds called with ids:', ids);
    return this.prisma.assetsApplication.findMany({
      where: { id: { in: ids } },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    return this.prisma.assetsApplication.update({
      where: { id },
      data: { status, processedAt: new Date() },
    });
  }

  async delete(ids: string[]) {
    return this.prisma.assetsApplication.deleteMany({
      where: { id: { in: ids } },
    });
  }
}

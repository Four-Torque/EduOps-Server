import { Injectable } from '@nestjs/common';
import { AssetsApplication, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { toKstDateRange } from 'src/global';

@Injectable()
export class AssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  updateStock(
    assetApplication: AssetsApplication & {
      category: { name: string };
      vendor: { name: string };
      user: { name: string };
    },
  ) {
    return this.prisma.asset.upsert({
      where: { name: assetApplication.name },
      update: {
        stock: {
          increment: assetApplication.quantity,
        },
      },
      create: {
        name: assetApplication.name,
        stock: assetApplication.quantity,
        category: {
          connect: {
            id: assetApplication.categoryId,
          },
        },
        vendor: {
          connect: {
            id: assetApplication.vendorId,
          },
        },
      },
    });
  }

  async findAll(
    take: number,
    skip: number,
    search?: string,
    categoryId?: string,
    vendorId?: string,
  ) {
    const where: Prisma.AssetWhereInput = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (vendorId) {
      where.vendorId = vendorId;
    }
    return this.prisma.asset.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
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
      },
    });
  }

  count(
    take: number,
    skip: number,
    search?: string,
    categoryId?: string,
    vendorId?: string,
  ): Promise<number> {
    const where: Prisma.AssetWhereInput = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (vendorId) {
      where.vendorId = vendorId;
    }
    return this.prisma.asset.count({
      where,
      take,
      skip,
    });
  }

  async getAssetApplicationsByStartDateAndEndDate(
    startDate: string,
    endDate: string,
  ) {
    const { gte, lt } = toKstDateRange(startDate, endDate);
    return this.prisma.assetsApplication.findMany({
      where: {
        status: {
          not: 'REJECTED',
        },
        processedAt: { gte, lt },
      },
      include: { user: true, category: true },
    });
  }
}

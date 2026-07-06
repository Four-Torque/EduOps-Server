import { Injectable } from '@nestjs/common';
import { AssetsApplication } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async findAll(take: number, skip: number, search?: string) {
    return this.prisma.asset.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
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

  count(take: number, skip: number, search?: string): Promise<number> {
    return this.prisma.asset.count({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      skip,
      take,
    });
  }
}

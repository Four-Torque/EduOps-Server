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
      where: {
        branchId_name: {
          branchId: assetApplication.branchId,
          name: assetApplication.name,
        },
      },
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
        branch: {
          connect: {
            id: assetApplication.branchId,
          },
        },
      },
    });
  }

  async findAll(branchId: string, take: number, skip: number, search?: string) {
    return this.prisma.asset.findMany({
      where: {
        branchId,
        ...(search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
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

  count(branchId: string, take: number, skip: number, search?: string): Promise<number> {
    return this.prisma.asset.count({
      where: {
        branchId,
        ...(search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      skip,
      take,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma, ClassFile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClassFileCreateInput): Promise<ClassFile> {
    return this.prisma.classFile.create({ data });
  }

  async findClassFiles(
    userId: string,
    classId?: string,
    fileName?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ files: any[]; total: number }> {
    const where = {
      uploaderId: userId,
      ...(classId && { classId }),
      ...(fileName && {
        fileName: {
          contains: fileName,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    const [files, total] = await this.prisma.$transaction([
      this.prisma.classFile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: { select: { name: true } },
          class: { select: { name: true } },
        },
      }),
      this.prisma.classFile.count({ where }),
    ]);

    return { files, total };
  }

  async findByClassId(classId: string): Promise<ClassFile[]> {
    return this.prisma.classFile.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: { name: true },
        },
      },
    });
  }

  async findById(id: string): Promise<ClassFile | null> {
    return this.prisma.classFile.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<ClassFile> {
    return this.prisma.classFile.delete({
      where: { id },
    });
  }

  saveAll(data: Prisma.ClassFileCreateManyInput[]) {
    return this.prisma.classFile.createMany({
      data,
    });
  }

  findAllByclassId(classIds: string[]): Promise<ClassFile[]> {
    return this.prisma.classFile.findMany({
      where: {
        classId: { in: classIds },
      },
    });
  }
}

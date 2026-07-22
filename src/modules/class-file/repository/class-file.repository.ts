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
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ files: any[]; total: number }> {
    const where = {
      uploaderId: userId,
      ...(classId && { classId }),
      ...(search && {
        fileName: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    const [files, total] = await Promise.all([
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

  async findByIds(ids: string[]): Promise<ClassFile[]> {
    return this.prisma.classFile.findMany({
      where: { id: { in: ids } },
    });
  }

  async delete(ids: string[]): Promise<{ count: number }> {
    return this.prisma.classFile.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async save(data: Prisma.ClassFileCreateInput): Promise<ClassFile> {
    return this.prisma.classFile.create({
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

  async updateUrl(id: string, filePath: string): Promise<ClassFile> {
    return this.prisma.classFile.update({
      where: { id },
      data: { filePath },
    });
  }
}

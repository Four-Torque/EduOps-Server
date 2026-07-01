import { Injectable } from '@nestjs/common';
import { Prisma, Role, User, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async resetPassword(data: Prisma.UserUpdateArgs) {
    return this.prisma.user.update(data);
  }

  async findList(
    role: Role,
    status: UserStatus,
    skip: number,
    take: number,
  ): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(status && { status }),
      },
      skip,
      take,
    });
  }

  async countList(role: Role, status: UserStatus): Promise<number> {
    return this.prisma.user.count({
      where: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

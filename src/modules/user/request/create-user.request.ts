import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  static toEntity(
    request: CreateUserRequest,
    hashedPassword: string,
  ): Prisma.UserCreateInput {
    return {
      email: request.email,
      name: request.name,
      phone: request.phone,
      password: hashedPassword,
    };
  }
}

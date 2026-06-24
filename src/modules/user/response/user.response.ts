import { Role, User, UserStatus } from '@prisma/client';

export class UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: Omit<User, 'password'>): UserResponse {
    const response = new UserResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.email = entity.email;
    response.phone = entity.phone;
    response.role = entity.role;
    response.status = entity.status;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}

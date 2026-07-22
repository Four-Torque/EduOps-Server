import { Subject } from '@prisma/client';

export class SubjectResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  public static fromEntity(entity: Subject): SubjectResponse {
    const response = new SubjectResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}

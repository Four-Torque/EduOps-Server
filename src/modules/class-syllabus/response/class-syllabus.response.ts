import { ApiProperty } from '@nestjs/swagger';
import { ClassSyllabus, SyllabusStatus } from '@prisma/client';

export class ClassSyllabusResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  capacity: number;

  @ApiProperty({ required: false })
  startDate: Date | null;

  @ApiProperty({ required: false })
  endDate: Date | null;

  @ApiProperty({ required: false })
  targetAudience: string | null;

  @ApiProperty({ required: false })
  description: string | null;

  @ApiProperty({ required: false })
  curriculum: string | null;

  @ApiProperty({ enum: SyllabusStatus })
  status: SyllabusStatus;

  @ApiProperty({ required: false })
  rejectedReason: string | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(entity: ClassSyllabus): ClassSyllabusResponse {
    const response = new ClassSyllabusResponse();
    response.id = entity.id;
    response.teacherId = entity.teacherId;
    response.name = entity.name;
    response.fee = entity.fee;
    response.capacity = entity.capacity;
    response.startDate = entity.startDate;
    response.endDate = entity.endDate;
    response.targetAudience = entity.targetAudience;
    response.description = entity.description;
    response.curriculum = entity.curriculum;
    response.status = entity.status;
    response.rejectedReason = entity.rejectedReason;
    response.createdAt = entity.createdAt;
    return response;
  }
}

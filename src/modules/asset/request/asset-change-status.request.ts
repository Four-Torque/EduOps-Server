import { ApplicationStatus } from '@prisma/client';

export class AssetChangeStatusRequest {
  status: ApplicationStatus;
  rejectedReason?: string;
}

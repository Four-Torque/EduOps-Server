/*
  Warnings:

  - You are about to drop the column `acceptedReason` on the `AssetsApplication` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `AssetsApplication` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AssetsApplication` table. All the data in the column will be lost.
  - Added the required column `vendorId` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `AssetsApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorId` to the `AssetsApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "vendorId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "AssetsApplication" DROP COLUMN "acceptedReason",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vendorId" UUID NOT NULL,
ALTER COLUMN "rejectedReason" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Vendor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetsApplication" ADD CONSTRAINT "AssetsApplication_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `assetId` to the `AssetsApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetsApplication" ADD COLUMN     "assetId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "AssetsApplication" ADD CONSTRAINT "AssetsApplication_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

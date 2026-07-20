/*
  Warnings:

  - You are about to drop the column `assetId` on the `AssetsApplication` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AssetsApplication" DROP CONSTRAINT "AssetsApplication_assetId_fkey";

-- AlterTable
ALTER TABLE "AssetsApplication" DROP COLUMN "assetId";

-- CreateIndex
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");

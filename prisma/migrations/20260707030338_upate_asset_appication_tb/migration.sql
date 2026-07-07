/*
  Warnings:

  - Made the column `branchId` on table `Asset` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `branchId` to the `AssetsApplication` table without a default value. This is not possible if the table is not empty.
  - Made the column `branchId` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Class` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_branchId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_branchId_fkey";

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "AssetsApplication" ADD COLUMN     "branchId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "branchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetsApplication" ADD CONSTRAINT "AssetsApplication_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

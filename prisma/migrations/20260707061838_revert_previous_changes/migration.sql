/*
  Warnings:

  - You are about to drop the column `branchId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `AssetsApplication` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `Academy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AssetsApplication" DROP CONSTRAINT "AssetsApplication_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_academyId_fkey";

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

-- DropIndex
DROP INDEX "Asset_branchId_name_key";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "AssetsApplication" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "branchId";

-- DropTable
DROP TABLE "Academy";

-- DropTable
DROP TABLE "Branch";

-- CreateIndex
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");

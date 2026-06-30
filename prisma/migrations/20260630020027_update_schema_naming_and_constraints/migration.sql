/*
  Warnings:

  - You are about to drop the column `amout` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `parent_phone` on the `Student` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPhone` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "stock" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "AssetsApplication" ALTER COLUMN "acceptedReason" DROP NOT NULL,
ALTER COLUMN "rejectedReason" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "examDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amout",
ADD COLUMN     "amount" INTEGER NOT NULL,
ALTER COLUMN "paymentDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Salary" ALTER COLUMN "paymentDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "parent_phone",
ADD COLUMN     "parentPhone" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "StudentAttendance" ALTER COLUMN "status" SET DEFAULT 'ABSENT';

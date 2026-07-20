/*
  Warnings:

  - Changed the type of `workDate` on the `StaffAttendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "StaffAttendance" DROP COLUMN "workDate",
ADD COLUMN     "workDate" VARCHAR(20) NOT NULL;

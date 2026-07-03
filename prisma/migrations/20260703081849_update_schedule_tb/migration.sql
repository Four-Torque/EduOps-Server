/*
  Warnings:

  - You are about to drop the column `room` on the `Class` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "room";

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "room" VARCHAR(50) NOT NULL DEFAULT '미배정';

/*
  Warnings:

  - Added the required column `fileSize` to the `ClassFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassFile" ADD COLUMN     "fileSize" INTEGER NOT NULL;

/*
  Warnings:

  - Added the required column `title` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Asset_name_key";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "title" VARCHAR(100) NOT NULL;

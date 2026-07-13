-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "address" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "AcademyInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "academyName" VARCHAR(100) NOT NULL,
    "representativeName" VARCHAR(100) NOT NULL,
    "representativePhone" VARCHAR(50) NOT NULL,
    "businessNumber" VARCHAR(50) NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyInfo_pkey" PRIMARY KEY ("id")
);

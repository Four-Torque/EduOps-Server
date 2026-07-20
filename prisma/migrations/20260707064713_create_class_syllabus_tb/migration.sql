-- CreateEnum
CREATE TYPE "SyllabusStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ClassSyllabus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teacherId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "fee" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "targetAudience" TEXT,
    "description" TEXT,
    "curriculum" TEXT,
    "status" "SyllabusStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSyllabus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClassSyllabus" ADD CONSTRAINT "ClassSyllabus_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

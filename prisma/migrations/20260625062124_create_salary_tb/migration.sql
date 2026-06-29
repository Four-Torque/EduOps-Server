-- CreateEnum
CREATE TYPE "SalaryStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Salary" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "baseSalary" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL,
    "paymentDate" TIMESTAMPTZ NOT NULL,
    "status" "SalaryStatus" NOT NULL DEFAULT 'PENDING',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

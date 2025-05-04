/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_methodId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_studentId_fkey";

-- DropTable
DROP TABLE "Payment";

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "methodId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_studentId_idx" ON "payment"("studentId");

-- CreateIndex
CREATE INDEX "payment_methodId_idx" ON "payment"("methodId");

-- CreateIndex
CREATE INDEX "student_managerId_idx" ON "student"("managerId");

-- CreateIndex
CREATE INDEX "student_curatorId_idx" ON "student"("curatorId");

-- CreateIndex
CREATE INDEX "student_group_id_idx" ON "student"("group_id");

-- CreateIndex
CREATE INDEX "student_course_id_idx" ON "student"("course_id");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

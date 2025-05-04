/*
  Warnings:

  - You are about to drop the column `reason_id` on the `refund` table. All the data in the column will be lost.
  - You are about to drop the column `curatorId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "refund" DROP CONSTRAINT "refund_reason_id_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_curatorId_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_managerId_fkey";

-- DropIndex
DROP INDEX "student_curatorId_idx";

-- DropIndex
DROP INDEX "student_managerId_idx";

-- AlterTable
ALTER TABLE "refund" DROP COLUMN "reason_id";

-- AlterTable
ALTER TABLE "student" DROP COLUMN "curatorId",
DROP COLUMN "managerId",
ADD COLUMN     "curator_id" TEXT,
ADD COLUMN     "delete_reason_id" INTEGER,
ADD COLUMN     "manager_id" TEXT;

-- CreateIndex
CREATE INDEX "student_manager_id_idx" ON "student"("manager_id");

-- CreateIndex
CREATE INDEX "student_curator_id_idx" ON "student"("curator_id");

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_delete_reason_id_fkey" FOREIGN KEY ("delete_reason_id") REFERENCES "refund_reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_curator_id_fkey" FOREIGN KEY ("curator_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

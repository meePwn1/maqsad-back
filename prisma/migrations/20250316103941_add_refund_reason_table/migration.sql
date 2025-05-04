/*
  Warnings:

  - You are about to drop the column `methodId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `payment_method` table. All the data in the column will be lost.
  - You are about to drop the column `refund_amount` on the `student` table. All the data in the column will be lost.
  - Added the required column `payment_method_id` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `payment_method` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_uz` to the `payment_method` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_methodId_fkey";

-- DropIndex
DROP INDEX "payment_methodId_idx";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "methodId",
ADD COLUMN     "payment_method_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payment_method" DROP COLUMN "code",
ADD COLUMN     "name_ru" TEXT NOT NULL,
ADD COLUMN     "name_uz" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student" DROP COLUMN "refund_amount";

-- DropEnum
DROP TYPE "PaymentMethodEnum";

-- CreateTable
CREATE TABLE "refund" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reason_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_reason" (
    "id" SERIAL NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,

    CONSTRAINT "refund_reason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refund_student_id_key" ON "refund"("student_id");

-- CreateIndex
CREATE INDEX "payment_payment_method_id_idx" ON "payment"("payment_method_id");

-- AddForeignKey
ALTER TABLE "refund" ADD CONSTRAINT "refund_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "refund_reason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund" ADD CONSTRAINT "refund_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

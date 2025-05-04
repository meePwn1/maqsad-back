/*
  Warnings:

  - You are about to drop the column `is_refund` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `refund_amount` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "is_refund",
DROP COLUMN "refund_amount";

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "is_refund" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refund_amount" INTEGER;

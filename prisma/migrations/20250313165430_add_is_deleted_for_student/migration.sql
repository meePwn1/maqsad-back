/*
  Warnings:

  - Added the required column `refund_amount` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "is_refund" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refund_amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "deleted_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

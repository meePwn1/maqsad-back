/*
  Warnings:

  - You are about to drop the `refund_reason` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_delete_reason_id_fkey";

-- DropTable
DROP TABLE "refund_reason";

-- CreateTable
CREATE TABLE "delete_reason" (
    "id" SERIAL NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,

    CONSTRAINT "delete_reason_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_delete_reason_id_fkey" FOREIGN KEY ("delete_reason_id") REFERENCES "delete_reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

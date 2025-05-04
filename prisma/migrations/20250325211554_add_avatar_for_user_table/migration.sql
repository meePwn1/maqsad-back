/*
  Warnings:

  - Added the required column `group_color` to the `group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group" ADD COLUMN     "group_color" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student" ALTER COLUMN "deleted_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar" TEXT,
ALTER COLUMN "last_name" DROP NOT NULL;

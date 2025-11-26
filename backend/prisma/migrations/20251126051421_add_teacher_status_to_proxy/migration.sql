/*
  Warnings:

  - Added the required column `dayOfWeek` to the `proxies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `proxies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('ABSENT', 'BUSY', 'HALF_DAY');

-- AlterEnum
ALTER TYPE "DayOfWeek" ADD VALUE 'SATURDAY';

-- AlterTable
ALTER TABLE "proxies" ADD COLUMN     "dayOfWeek" INTEGER NOT NULL,
ADD COLUMN     "status" "TeacherStatus" NOT NULL;

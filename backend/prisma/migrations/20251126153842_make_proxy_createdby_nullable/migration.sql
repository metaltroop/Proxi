-- DropForeignKey
ALTER TABLE "proxies" DROP CONSTRAINT "proxies_createdBy_fkey";

-- AlterTable
ALTER TABLE "proxies" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "proxies" ADD CONSTRAINT "proxies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

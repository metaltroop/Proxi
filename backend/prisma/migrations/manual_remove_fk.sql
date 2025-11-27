-- Drop the foreign key constraint on createdBy
ALTER TABLE "proxies" DROP CONSTRAINT IF EXISTS "proxies_createdBy_fkey";

-- The createdBy column is already nullable from previous migration
-- No need to alter it again

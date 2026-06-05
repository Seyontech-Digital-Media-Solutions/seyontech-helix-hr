-- Migration: Add UserRole enum and update UserProfile role column

-- Step 1: Create the UserRole enum type
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER');

-- Step 2: Alter the UserProfile table to change role column type
-- First, create a temporary column with the new type
ALTER TABLE "UserProfile" ADD COLUMN "role_new" "UserRole";

-- Step 3: Copy existing data with case conversion
UPDATE "UserProfile" 
SET "role_new" = CASE 
  WHEN UPPER("role") = 'ADMIN' THEN 'ADMIN'::\"UserRole\"
  WHEN UPPER("role") = 'MANAGER' THEN 'MANAGER'::\"UserRole\"
  ELSE 'EMPLOYEE'::\"UserRole\"
END;

-- Step 4: Drop the old column and rename the new one
ALTER TABLE "UserProfile" DROP COLUMN "role";
ALTER TABLE "UserProfile" RENAME COLUMN "role_new" TO "role";

-- Step 5: Set the default value
ALTER TABLE "UserProfile" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE'::"UserRole";

-- Step 6: Add NOT NULL constraint if needed
ALTER TABLE "UserProfile" ALTER COLUMN "role" SET NOT NULL;

-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- Add nullable columns first so existing data can be backfilled safely.
ALTER TABLE "Transaction"
ADD COLUMN "householdId" TEXT,
ADD COLUMN "createdById" TEXT;

ALTER TABLE "Category"
ADD COLUMN "householdId" TEXT;

ALTER TABLE "Goal"
ADD COLUMN "householdId" TEXT;

ALTER TABLE "Card"
ADD COLUMN "householdId" TEXT;

-- Existing rows need generated ids because previous migrations use Prisma-side uuid generation.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TEMP TABLE "_UserHouseholdMigration" (
    "userId" TEXT PRIMARY KEY,
    "householdId" TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO "_UserHouseholdMigration" ("userId", "householdId")
SELECT "id", gen_random_uuid()::text
FROM "User";

INSERT INTO "Household" ("id", "name", "createdAt")
SELECT
    migration."householdId",
    COALESCE(NULLIF("User"."name", ''), "User"."email", 'Household') || ' Household',
    CURRENT_TIMESTAMP
FROM "_UserHouseholdMigration" migration
JOIN "User" ON "User"."id" = migration."userId";

INSERT INTO "HouseholdMember" ("id", "householdId", "userId", "role")
SELECT
    gen_random_uuid()::text,
    "householdId",
    "userId",
    'OWNER'
FROM "_UserHouseholdMigration";

UPDATE "Transaction"
SET
    "householdId" = migration."householdId",
    "createdById" = "Transaction"."userId"
FROM "_UserHouseholdMigration" migration
WHERE "Transaction"."userId" = migration."userId";

UPDATE "Category"
SET "householdId" = migration."householdId"
FROM "_UserHouseholdMigration" migration
WHERE "Category"."userId" = migration."userId";

UPDATE "Goal"
SET "householdId" = migration."householdId"
FROM "_UserHouseholdMigration" migration
WHERE "Goal"."userId" = migration."userId";

UPDATE "Card"
SET "householdId" = migration."householdId"
FROM "_UserHouseholdMigration" migration
WHERE "Card"."userId" = migration."userId";

-- Enforce required fields only after all existing rows are migrated.
ALTER TABLE "Transaction"
ALTER COLUMN "householdId" SET NOT NULL,
ALTER COLUMN "createdById" SET NOT NULL;

ALTER TABLE "Category"
ALTER COLUMN "householdId" SET NOT NULL;

ALTER TABLE "Goal"
ALTER COLUMN "householdId" SET NOT NULL;

ALTER TABLE "Card"
ALTER COLUMN "householdId" SET NOT NULL;

-- Drop old ownership foreign keys and columns after successful backfill.
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_userId_fkey";
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_fkey";

DROP INDEX IF EXISTS "Card_userId_idx";

ALTER TABLE "Transaction" DROP COLUMN "userId";
ALTER TABLE "Category" DROP COLUMN "userId";
ALTER TABLE "Goal" DROP COLUMN "userId";
ALTER TABLE "Card" DROP COLUMN "userId";

-- Indexes for household filtering and transaction audit queries.
CREATE INDEX "HouseholdMember_userId_idx" ON "HouseholdMember"("userId");
CREATE INDEX "HouseholdMember_householdId_idx" ON "HouseholdMember"("householdId");
CREATE UNIQUE INDEX "HouseholdMember_householdId_userId_key" ON "HouseholdMember"("householdId", "userId");

CREATE INDEX "Transaction_householdId_idx" ON "Transaction"("householdId");
CREATE INDEX "Transaction_createdById_idx" ON "Transaction"("createdById");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

CREATE INDEX "Category_householdId_idx" ON "Category"("householdId");
CREATE INDEX "Goal_householdId_idx" ON "Goal"("householdId");
CREATE INDEX "Card_householdId_idx" ON "Card"("householdId");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Category" ADD CONSTRAINT "Category_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

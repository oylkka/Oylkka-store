-- AUTH-08: better-auth 1.7.x two-factor plugin added brute-force lockout
-- tracking to the two_factor model. Without these columns the auth runtime
-- fails its schema check with "Prisma schema mismatch".

-- AlterTable
ALTER TABLE "two_factor" ADD COLUMN "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockedUntil" TIMESTAMP(3);

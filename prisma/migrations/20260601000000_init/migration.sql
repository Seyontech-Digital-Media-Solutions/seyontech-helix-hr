CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "SubmissionType" AS ENUM ('PRE_JOINING', 'POST_JOINING');
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'JOINED', 'REJECTED');

CREATE TABLE "UserProfile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "supabaseUserId" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "fullName" TEXT,
  "role" TEXT NOT NULL DEFAULT 'employee',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "referenceId" TEXT NOT NULL,
  "type" "SubmissionType" NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
  "applicantName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "position" TEXT,
  "department" TEXT,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "submittedById" UUID NOT NULL,

  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserProfile_supabaseUserId_key" ON "UserProfile"("supabaseUserId");
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
CREATE UNIQUE INDEX "Submission_referenceId_key" ON "Submission"("referenceId");
CREATE INDEX "Submission_type_idx" ON "Submission"("type");
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");
CREATE INDEX "Submission_submittedById_idx" ON "Submission"("submittedById");

ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_submittedById_fkey"
  FOREIGN KEY ("submittedById")
  REFERENCES "UserProfile"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

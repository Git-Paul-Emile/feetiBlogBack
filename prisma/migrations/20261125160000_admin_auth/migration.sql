ALTER TABLE "feeti_blog"."articles"
  ALTER COLUMN "imageUrl" SET DEFAULT '',
  ALTER COLUMN "imagePublicId" SET DEFAULT '';

CREATE TABLE "feeti_blog"."admin_users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feeti_blog"."admin_sessions" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feeti_blog"."admin_email_verification_tokens" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_email_verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_users_email_key" ON "feeti_blog"."admin_users"("email");
CREATE UNIQUE INDEX "admin_sessions_tokenHash_key" ON "feeti_blog"."admin_sessions"("tokenHash");
CREATE UNIQUE INDEX "admin_email_verification_tokens_tokenHash_key"
  ON "feeti_blog"."admin_email_verification_tokens"("tokenHash");
CREATE INDEX "admin_sessions_adminId_expiresAt_idx"
  ON "feeti_blog"."admin_sessions"("adminId", "expiresAt");
CREATE INDEX "admin_email_verification_tokens_adminId_expiresAt_idx"
  ON "feeti_blog"."admin_email_verification_tokens"("adminId", "expiresAt");

ALTER TABLE "feeti_blog"."admin_sessions"
  ADD CONSTRAINT "admin_sessions_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "feeti_blog"."admin_users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "feeti_blog"."admin_email_verification_tokens"
  ADD CONSTRAINT "admin_email_verification_tokens_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "feeti_blog"."admin_users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

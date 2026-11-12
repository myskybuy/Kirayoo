-- CreateEnum
CREATE TYPE "OwnerStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ownerRejectReason" TEXT,
ADD COLUMN     "ownerStatus" "OwnerStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "OwnerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "categories" "Category"[],
    "plans" TEXT NOT NULL,
    "termsAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "OwnerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerApplication_userId_key" ON "OwnerApplication"("userId");

-- AddForeignKey
ALTER TABLE "OwnerApplication" ADD CONSTRAINT "OwnerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Existing owners (anyone who has listed an item) keep their panel access.
UPDATE "User" SET "ownerStatus" = 'APPROVED' WHERE "id" IN (SELECT DISTINCT "ownerId" FROM "Item");

-- CreateEnum
CREATE TYPE "public"."ExpirationStatus" AS ENUM ('EXPIRING_LESS_THAN_3_MONTHS', 'EXPIRING_IN_A_MONTH', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."InvestmentType" AS ENUM ('deposit', 'bankDeposit', 'governmentBond', 'corporateBond', 'eVMS');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Investment" (
    "id" TEXT NOT NULL,
    "organisationName" TEXT NOT NULL,
    "relatedData" TEXT,
    "investmentType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "investmentAmount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "incomeTax" DOUBLE PRECISION NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "expirationStatus" "public"."ExpirationStatus" NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "public"."User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Investment_userId_idx" ON "public"."Investment"("userId");

-- AddForeignKey
ALTER TABLE "public"."Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("clerkUserId") ON DELETE CASCADE ON UPDATE CASCADE;

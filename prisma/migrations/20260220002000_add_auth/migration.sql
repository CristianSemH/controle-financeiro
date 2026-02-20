/*
  Warnings:

  - You are about to alter the column `targetAmount` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `isRecurring` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - Added the required column `userId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "targetAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isRecurring",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

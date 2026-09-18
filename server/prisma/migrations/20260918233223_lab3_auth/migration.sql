-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "IT_Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_requesterId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "itPriority" "IT_Priority",
ADD COLUMN     "ownerId" INTEGER;

-- RenameTable to preserve data
ALTER TABLE "RequesterUser" RENAME TO "User";
ALTER SEQUENCE "RequesterUser_id_seq" RENAME TO "User_id_seq";
ALTER INDEX "RequesterUser_pkey" RENAME TO "User_pkey";

-- AddColumns to User
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '$2b$10$EpD3bW5gMow2B.tI4L.F1u7Lp2D2YfN1I0qU3Z1w9jA.2J0Z2Z2Z2';
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'REQUESTER';
ALTER TABLE "User" ADD COLUMN "requiresPasswordChange" BOOLEAN NOT NULL DEFAULT true;

-- RenameIndex
ALTER INDEX "RequesterUser_email_key" RENAME TO "User_email_key";

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

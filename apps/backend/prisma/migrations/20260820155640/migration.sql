-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isConnected" BOOLEAN NOT NULL DEFAULT true;

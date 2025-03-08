/*
  Warnings:

  - You are about to drop the column `userId` on the `Plugin` table. All the data in the column will be lost.
  - You are about to drop the `UserPlugins` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatbotId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Plugin" DROP CONSTRAINT "Plugin_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlugins" DROP CONSTRAINT "UserPlugins_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlugins" DROP CONSTRAINT "UserPlugins_userId_fkey";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "chatbotId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "userId";

-- DropTable
DROP TABLE "UserPlugins";

-- CreateTable
CREATE TABLE "Chatbot" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotPlugins" (
    "chatbotId" INTEGER NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChatbotPlugins_pkey" PRIMARY KEY ("chatbotId","pluginId")
);

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotPlugins" ADD CONSTRAINT "ChatbotPlugins_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotPlugins" ADD CONSTRAINT "ChatbotPlugins_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

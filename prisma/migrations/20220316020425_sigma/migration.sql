/*
  Warnings:

  - The primary key for the `Case` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `active` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `Case` table. All the data in the column will be lost.
  - Made the column `updated` on table `Case` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Case_uuid_key";

-- DropIndex
DROP INDEX "GuildConfig_guild_id_key";

-- AlterTable
ALTER TABLE "Case" DROP CONSTRAINT "Case_pkey",
DROP COLUMN "active",
DROP COLUMN "expires",
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "created" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated" SET NOT NULL,
ALTER COLUMN "updated" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Case_pkey" PRIMARY KEY ("uuid");

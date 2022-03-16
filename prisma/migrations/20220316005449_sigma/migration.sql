-- CreateEnum
CREATE TYPE "CaseAction" AS ENUM ('Role', 'Timeout', 'Kick', 'Ban');

-- CreateTable
CREATE TABLE "GuildConfig" (
    "guild_id" TEXT NOT NULL,
    "prefix" VARCHAR(4) NOT NULL DEFAULT E'!',
    "disabled_commands" TEXT[],
    "modlogs_channel_id" TEXT NOT NULL,
    "memberlogs_channel_id" TEXT NOT NULL,
    "messagelogs_channel_id" TEXT NOT NULL,

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "Case" (
    "uuid" UUID NOT NULL,
    "case_id" INTEGER NOT NULL,
    "ref_id" INTEGER,
    "action" "CaseAction" NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "mod_id" TEXT NOT NULL,
    "reason" TEXT,
    "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "expires" TIMESTAMP,
    "active" BOOLEAN,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guild_id_key" ON "GuildConfig"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "Case_uuid_key" ON "Case"("uuid");

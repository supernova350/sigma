-- AlterTable
ALTER TABLE "GuildConfig" ALTER COLUMN "modlogs_channel_id" SET DEFAULT E'',
ALTER COLUMN "memberlogs_channel_id" SET DEFAULT E'',
ALTER COLUMN "messagelogs_channel_id" SET DEFAULT E'';

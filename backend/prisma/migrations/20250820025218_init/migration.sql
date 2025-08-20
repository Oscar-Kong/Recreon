-- CreateEnum
CREATE TYPE "public"."SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MatchType" AS ENUM ('CASUAL', 'RANKED', 'TOURNAMENT', 'PRACTICE');

-- CreateEnum
CREATE TYPE "public"."ParticipantStatus" AS ENUM ('CONFIRMED', 'PENDING', 'DECLINED', 'WAITLIST');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100),
    "avatar_url" VARCHAR(500),
    "avatar_color" VARCHAR(7),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "user_id" INTEGER NOT NULL,
    "bio" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "phone_number" VARCHAR(20),
    "preferred_sports" TEXT[],
    "availability" JSONB,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."sports" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(100),
    "max_players" INTEGER NOT NULL,
    "min_players" INTEGER NOT NULL,
    "is_team_sport" BOOLEAN NOT NULL DEFAULT false,
    "scoring_system" JSONB,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sport_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "skill_level" "public"."SkillLevel" NOT NULL,
    "years_playing" INTEGER,
    "preferred_position" TEXT,
    "achievements" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "matches_won" INTEGER NOT NULL DEFAULT 0,
    "win_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_sport_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_rankings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "season_id" INTEGER NOT NULL,
    "elo_rating" INTEGER NOT NULL DEFAULT 1200,
    "peak_rating" INTEGER NOT NULL DEFAULT 1200,
    "city_rank" INTEGER,
    "state_rank" INTEGER,
    "country_rank" INTEGER,
    "global_rank" INTEGER,
    "ranked_matches_played" INTEGER NOT NULL DEFAULT 0,
    "ranked_matches_won" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ranking_seasons" (
    "id" SERIAL NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ranking_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenges" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "match_id" INTEGER,
    "proposed_time" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "stake" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."matches" (
    "id" SERIAL NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "match_type" "public"."MatchType" NOT NULL,
    "status" "public"."MatchStatus" NOT NULL,
    "venue" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "max_players" INTEGER NOT NULL,
    "min_players" INTEGER NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "skill_level_min" "public"."SkillLevel",
    "skill_level_max" "public"."SkillLevel",
    "score_data" JSONB,
    "winner_team" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."match_participants" (
    "match_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "team" INTEGER,
    "position" VARCHAR(50),
    "score" INTEGER,
    "stats" JSONB,
    "performance_rating" DOUBLE PRECISION,
    "elo_change" INTEGER,
    "ranking_id" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("match_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "event_type" VARCHAR(50) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "registration_deadline" TIMESTAMP(3),
    "venue" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "max_participants" INTEGER,
    "min_participants" INTEGER,
    "skill_level_min" "public"."SkillLevel",
    "skill_level_max" "public"."SkillLevel",
    "entry_fee" DOUBLE PRECISION,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_participants" (
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "public"."ParticipantStatus" NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_in_at" TIMESTAMP(3),
    "seed" INTEGER,
    "final_position" INTEGER,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."event_tags" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "tag_name" VARCHAR(50) NOT NULL,
    "tag_color" VARCHAR(7),

    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" SERIAL NOT NULL,
    "conversation_type" VARCHAR(20) NOT NULL DEFAULT 'direct',
    "context" VARCHAR(50),
    "avatar_color" VARCHAR(7),
    "title" VARCHAR(100),
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_participants" (
    "conversation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" VARCHAR(20) NOT NULL DEFAULT 'text',
    "metadata" JSONB,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guides" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER,
    "sport_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "skill_level" "public"."SkillLevel",
    "read_time" INTEGER,
    "thumbnail_url" VARCHAR(500),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_city_state_country_idx" ON "public"."users"("city", "state", "country");

-- CreateIndex
CREATE UNIQUE INDEX "sports_name_key" ON "public"."sports"("name");

-- CreateIndex
CREATE INDEX "user_sport_profiles_sport_id_skill_level_idx" ON "public"."user_sport_profiles"("sport_id", "skill_level");

-- CreateIndex
CREATE UNIQUE INDEX "user_sport_profiles_user_id_sport_id_key" ON "public"."user_sport_profiles"("user_id", "sport_id");

-- CreateIndex
CREATE INDEX "user_rankings_sport_id_elo_rating_idx" ON "public"."user_rankings"("sport_id", "elo_rating" DESC);

-- CreateIndex
CREATE INDEX "user_rankings_sport_id_city_rank_idx" ON "public"."user_rankings"("sport_id", "city_rank");

-- CreateIndex
CREATE INDEX "user_rankings_sport_id_state_rank_idx" ON "public"."user_rankings"("sport_id", "state_rank");

-- CreateIndex
CREATE INDEX "user_rankings_sport_id_country_rank_idx" ON "public"."user_rankings"("sport_id", "country_rank");

-- CreateIndex
CREATE UNIQUE INDEX "user_rankings_user_id_sport_id_season_id_key" ON "public"."user_rankings"("user_id", "sport_id", "season_id");

-- CreateIndex
CREATE INDEX "ranking_seasons_sport_id_is_active_idx" ON "public"."ranking_seasons"("sport_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_match_id_key" ON "public"."challenges"("match_id");

-- CreateIndex
CREATE INDEX "challenges_receiver_id_status_idx" ON "public"."challenges"("receiver_id", "status");

-- CreateIndex
CREATE INDEX "matches_sport_id_status_scheduled_time_idx" ON "public"."matches"("sport_id", "status", "scheduled_time");

-- CreateIndex
CREATE INDEX "matches_latitude_longitude_idx" ON "public"."matches"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "events_sport_id_start_time_idx" ON "public"."events"("sport_id", "start_time");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "public"."messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "guides_sport_id_skill_level_idx" ON "public"."guides"("sport_id", "skill_level");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sport_profiles" ADD CONSTRAINT "user_sport_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sport_profiles" ADD CONSTRAINT "user_sport_profiles_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_rankings" ADD CONSTRAINT "user_rankings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_rankings" ADD CONSTRAINT "user_rankings_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_rankings" ADD CONSTRAINT "user_rankings_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."ranking_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ranking_seasons" ADD CONSTRAINT "ranking_seasons_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_participants" ADD CONSTRAINT "match_participants_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_participants" ADD CONSTRAINT "match_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_participants" ADD CONSTRAINT "match_participants_ranking_id_fkey" FOREIGN KEY ("ranking_id") REFERENCES "public"."user_rankings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_tags" ADD CONSTRAINT "event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guides" ADD CONSTRAINT "guides_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guides" ADD CONSTRAINT "guides_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

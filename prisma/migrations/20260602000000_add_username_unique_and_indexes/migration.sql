-- AlterTable: username に UNIQUE 制約を追加
ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE ("username");

-- CreateIndex: posts
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at" DESC);

-- CreateIndex: likes
CREATE INDEX "likes_user_id_idx" ON "likes"("user_id");

-- CreateIndex: want_to_go
CREATE INDEX "want_to_go_user_id_idx" ON "want_to_go"("user_id");

-- CreateIndex: follows
CREATE INDEX "follows_follower_id_idx" ON "follows"("follower_id");
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex: navi_threads
CREATE INDEX "navi_threads_user_id_idx" ON "navi_threads"("user_id");

-- CreateIndex: navi_messages
CREATE INDEX "navi_messages_thread_id_idx" ON "navi_messages"("thread_id");

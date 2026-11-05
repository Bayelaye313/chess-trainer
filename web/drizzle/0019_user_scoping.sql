PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`source` text NOT NULL,
	`external_id` text,
	`pgn` text,
	`initial_fen` text NOT NULL,
	`final_fen` text,
	`player_color` text NOT NULL,
	`player_rating` integer,
	`opponent_name` text,
	`opponent_rating` integer,
	`engine_elo` integer,
	`result` text,
	`termination` text,
	`time_control` text,
	`eco` text,
	`opening_name` text,
	`played_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`analysed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_games`("id", "user_id", "source", "external_id", "pgn", "initial_fen", "final_fen", "player_color", "player_rating", "opponent_name", "opponent_rating", "engine_elo", "result", "termination", "time_control", "eco", "opening_name", "played_at", "created_at", "analysed_at") SELECT "id", "user_id", "source", "external_id", "pgn", "initial_fen", "final_fen", "player_color", "player_rating", "opponent_name", "opponent_rating", "engine_elo", "result", "termination", "time_control", "eco", "opening_name", "played_at", "created_at", "analysed_at" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `games_user_source_external_idx` ON `games` (`user_id`,`source`,`external_id`);--> statement-breakpoint
CREATE INDEX `games_user_played_idx` ON `games` (`user_id`,`played_at`);--> statement-breakpoint
CREATE INDEX `games_played_at_idx` ON `games` (`played_at`);--> statement-breakpoint
CREATE INDEX `games_eco_idx` ON `games` (`eco`);--> statement-breakpoint
CREATE TABLE `__new_platform_links` (
	`user_id` text,
	`source` text NOT NULL,
	`username` text NOT NULL,
	`linked_at` integer NOT NULL,
	`last_synced_at` integer,
	`last_imported_played_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_platform_links`("user_id", "source", "username", "linked_at", "last_synced_at", "last_imported_played_at") SELECT "user_id", "source", "username", "linked_at", "last_synced_at", "last_imported_played_at" FROM `platform_links`;--> statement-breakpoint
DROP TABLE `platform_links`;--> statement-breakpoint
ALTER TABLE `__new_platform_links` RENAME TO `platform_links`;--> statement-breakpoint
CREATE UNIQUE INDEX `platform_links_user_source_idx` ON `platform_links` (`user_id`,`source`);--> statement-breakpoint
CREATE TABLE `__new_daily_sets` (
	`user_id` text,
	`day` text NOT NULL,
	`puzzle_ids` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_daily_sets`("user_id", "day", "puzzle_ids", "created_at") SELECT "user_id", "day", "puzzle_ids", "created_at" FROM `daily_sets`;--> statement-breakpoint
DROP TABLE `daily_sets`;--> statement-breakpoint
ALTER TABLE `__new_daily_sets` RENAME TO `daily_sets`;--> statement-breakpoint
CREATE UNIQUE INDEX `daily_sets_user_day_idx` ON `daily_sets` (`user_id`,`day`);--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`user_id` text,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_settings`("user_id", "key", "value", "updated_at") SELECT "user_id", "key", "value", "updated_at" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
CREATE UNIQUE INDEX `settings_user_key_idx` ON `settings` (`user_id`,`key`);--> statement-breakpoint
CREATE TABLE `__new_bot_game_results` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`game_id` text NOT NULL,
	`bot_profile` text NOT NULL,
	`bot_elo` integer NOT NULL,
	`accuracy` integer,
	`performance_elo` integer NOT NULL,
	`result` text,
	`termination` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_bot_game_results`("id", "user_id", "game_id", "bot_profile", "bot_elo", "accuracy", "performance_elo", "result", "termination", "created_at") SELECT "id", "user_id", "game_id", "bot_profile", "bot_elo", "accuracy", "performance_elo", "result", "termination", "created_at" FROM `bot_game_results`;--> statement-breakpoint
DROP TABLE `bot_game_results`;--> statement-breakpoint
ALTER TABLE `__new_bot_game_results` RENAME TO `bot_game_results`;--> statement-breakpoint
CREATE UNIQUE INDEX `bot_game_results_game_idx` ON `bot_game_results` (`game_id`);--> statement-breakpoint
CREATE INDEX `bot_game_results_created_idx` ON `bot_game_results` (`created_at`);--> statement-breakpoint
CREATE INDEX `bot_game_results_user_idx` ON `bot_game_results` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`game_id` text NOT NULL,
	`ply` integer NOT NULL,
	`side` text NOT NULL,
	`by_player` integer NOT NULL,
	`uci` text NOT NULL,
	`san` text NOT NULL,
	`fen_before` text NOT NULL,
	`cp_before` integer,
	`mate_before` integer,
	`cp_after` integer,
	`mate_after` integer,
	`cp_loss` integer,
	`quality` text NOT NULL,
	`phase` text NOT NULL,
	`best_uci` text,
	`best_san` text,
	`best_pv` text DEFAULT '[]' NOT NULL,
	`mate_missed` integer DEFAULT false NOT NULL,
	`motifs` text DEFAULT '[]' NOT NULL,
	`motif_found` integer DEFAULT false NOT NULL,
	`clock_ms` integer,
	`think_seconds` real,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_moves`("id", "user_id", "game_id", "ply", "side", "by_player", "uci", "san", "fen_before", "cp_before", "mate_before", "cp_after", "mate_after", "cp_loss", "quality", "phase", "best_uci", "best_san", "best_pv", "mate_missed", "motifs", "motif_found", "clock_ms", "think_seconds") SELECT "id", "user_id", "game_id", "ply", "side", "by_player", "uci", "san", "fen_before", "cp_before", "mate_before", "cp_after", "mate_after", "cp_loss", "quality", "phase", "best_uci", "best_san", "best_pv", "mate_missed", "motifs", "motif_found", "clock_ms", "think_seconds" FROM `moves`;--> statement-breakpoint
DROP TABLE `moves`;--> statement-breakpoint
ALTER TABLE `__new_moves` RENAME TO `moves`;--> statement-breakpoint
CREATE INDEX `moves_game_idx` ON `moves` (`game_id`,`ply`);--> statement-breakpoint
CREATE INDEX `moves_user_idx` ON `moves` (`user_id`);--> statement-breakpoint
CREATE INDEX `moves_quality_idx` ON `moves` (`by_player`,`quality`);--> statement-breakpoint
CREATE INDEX `moves_phase_idx` ON `moves` (`by_player`,`phase`);--> statement-breakpoint
CREATE TABLE `__new_puzzle_purges` (
	`move_id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`game_id` text,
	`fen_before` text NOT NULL,
	`reason` text NOT NULL,
	`purged_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_puzzle_purges`("move_id", "user_id", "game_id", "fen_before", "reason", "purged_at") SELECT "move_id", "user_id", "game_id", "fen_before", "reason", "purged_at" FROM `puzzle_purges`;--> statement-breakpoint
DROP TABLE `puzzle_purges`;--> statement-breakpoint
ALTER TABLE `__new_puzzle_purges` RENAME TO `puzzle_purges`;--> statement-breakpoint
CREATE INDEX `puzzle_purges_user_idx` ON `puzzle_purges` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_puzzles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`deck` text NOT NULL,
	`game_id` text,
	`move_id` integer,
	`fen_before` text NOT NULL,
	`solution` text NOT NULL,
	`solution_san` text NOT NULL,
	`played_uci` text,
	`played_san` text,
	`quality` text,
	`phase` text,
	`cp_loss` integer,
	`mate_missed` integer DEFAULT false NOT NULL,
	`motifs` text DEFAULT '[]' NOT NULL,
	`rating` integer,
	`coach_comment` text,
	`alternatives` text,
	`audited_at` integer,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_puzzles`("id", "user_id", "deck", "game_id", "move_id", "fen_before", "solution", "solution_san", "played_uci", "played_san", "quality", "phase", "cp_loss", "mate_missed", "motifs", "rating", "coach_comment", "alternatives", "audited_at", "source", "created_at") SELECT "id", "user_id", "deck", "game_id", "move_id", "fen_before", "solution", "solution_san", "played_uci", "played_san", "quality", "phase", "cp_loss", "mate_missed", "motifs", "rating", "coach_comment", "alternatives", "audited_at", "source", "created_at" FROM `puzzles`;--> statement-breakpoint
DROP TABLE `puzzles`;--> statement-breakpoint
ALTER TABLE `__new_puzzles` RENAME TO `puzzles`;--> statement-breakpoint
CREATE INDEX `puzzles_deck_idx` ON `puzzles` (`deck`);--> statement-breakpoint
CREATE INDEX `puzzles_user_idx` ON `puzzles` (`user_id`);--> statement-breakpoint
CREATE INDEX `puzzles_game_idx` ON `puzzles` (`game_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `puzzles_move_idx` ON `puzzles` (`move_id`);--> statement-breakpoint
CREATE TABLE `__new_review_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`puzzle_id` text NOT NULL,
	`rating` integer NOT NULL,
	`state` integer NOT NULL,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`elapsed_days` integer NOT NULL,
	`last_elapsed_days` integer NOT NULL,
	`scheduled_days` integer NOT NULL,
	`played_uci` text,
	`solved_ms` integer,
	`reviewed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`puzzle_id`) REFERENCES `puzzles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_review_logs`("id", "user_id", "puzzle_id", "rating", "state", "due", "stability", "difficulty", "elapsed_days", "last_elapsed_days", "scheduled_days", "played_uci", "solved_ms", "reviewed_at") SELECT "id", "user_id", "puzzle_id", "rating", "state", "due", "stability", "difficulty", "elapsed_days", "last_elapsed_days", "scheduled_days", "played_uci", "solved_ms", "reviewed_at" FROM `review_logs`;--> statement-breakpoint
DROP TABLE `review_logs`;--> statement-breakpoint
ALTER TABLE `__new_review_logs` RENAME TO `review_logs`;--> statement-breakpoint
CREATE INDEX `review_logs_puzzle_idx` ON `review_logs` (`puzzle_id`);--> statement-breakpoint
CREATE INDEX `review_logs_date_idx` ON `review_logs` (`reviewed_at`);--> statement-breakpoint
CREATE INDEX `review_logs_user_idx` ON `review_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`puzzle_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`scheduled_days` integer NOT NULL,
	`learning_steps` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`state` integer DEFAULT 0 NOT NULL,
	`last_review` integer,
	FOREIGN KEY (`puzzle_id`) REFERENCES `puzzles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("puzzle_id", "user_id", "due", "stability", "difficulty", "scheduled_days", "learning_steps", "reps", "lapses", "state", "last_review") SELECT "puzzle_id", "user_id", "due", "stability", "difficulty", "scheduled_days", "learning_steps", "reps", "lapses", "state", "last_review" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE INDEX `reviews_due_idx` ON `reviews` (`due`);--> statement-breakpoint
CREATE INDEX `reviews_user_due_idx` ON `reviews` (`user_id`,`due`);--> statement-breakpoint
CREATE TABLE `__new_sparring_moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`session_id` text NOT NULL,
	`ply` integer NOT NULL,
	`fen_before` text NOT NULL,
	`uci` text NOT NULL,
	`by_player` integer NOT NULL,
	`policy_score` real,
	`think_ms` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sparring_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sparring_moves`("id", "user_id", "session_id", "ply", "fen_before", "uci", "by_player", "policy_score", "think_ms") SELECT "id", "user_id", "session_id", "ply", "fen_before", "uci", "by_player", "policy_score", "think_ms" FROM `sparring_moves`;--> statement-breakpoint
DROP TABLE `sparring_moves`;--> statement-breakpoint
ALTER TABLE `__new_sparring_moves` RENAME TO `sparring_moves`;--> statement-breakpoint
CREATE INDEX `sparring_moves_session_idx` ON `sparring_moves` (`session_id`,`ply`);--> statement-breakpoint
CREATE INDEX `sparring_moves_user_idx` ON `sparring_moves` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_user_theme_progress` (
	`user_id` text NOT NULL,
	`theme_id` text NOT NULL,
	`completed_count` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `theme_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `curriculum_themes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_theme_progress`("user_id", "theme_id", "completed_count", "completed_at", "updated_at") SELECT "user_id", "theme_id", "completed_count", "completed_at", "updated_at" FROM `user_theme_progress`;--> statement-breakpoint
DROP TABLE `user_theme_progress`;--> statement-breakpoint
ALTER TABLE `__new_user_theme_progress` RENAME TO `user_theme_progress`;--> statement-breakpoint
CREATE TABLE `__new_opening_endurance_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opening_id` text NOT NULL,
	`opening_name` text NOT NULL,
	`variation_key` text NOT NULL,
	`variation_label` text NOT NULL,
	`first_mistake_ply` integer,
	`last_ply` integer NOT NULL,
	`accuracy` real NOT NULL,
	`played_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_opening_endurance_sessions`("id", "user_id", "opening_id", "opening_name", "variation_key", "variation_label", "first_mistake_ply", "last_ply", "accuracy", "played_at") SELECT "id", "user_id", "opening_id", "opening_name", "variation_key", "variation_label", "first_mistake_ply", "last_ply", "accuracy", "played_at" FROM `opening_endurance_sessions`;--> statement-breakpoint
DROP TABLE `opening_endurance_sessions`;--> statement-breakpoint
ALTER TABLE `__new_opening_endurance_sessions` RENAME TO `opening_endurance_sessions`;--> statement-breakpoint
CREATE INDEX `opening_endurance_user_time_idx` ON `opening_endurance_sessions` (`user_id`,`played_at`);--> statement-breakpoint
CREATE TABLE `__new_opening_mistake_review` (
	`user_id` text NOT NULL,
	`fen_before` text NOT NULL,
	`actual_uci` text NOT NULL,
	`reviewed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `fen_before`, `actual_uci`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_opening_mistake_review`("user_id", "fen_before", "actual_uci", "reviewed_at") SELECT "user_id", "fen_before", "actual_uci", "reviewed_at" FROM `opening_mistake_review`;--> statement-breakpoint
DROP TABLE `opening_mistake_review`;--> statement-breakpoint
ALTER TABLE `__new_opening_mistake_review` RENAME TO `opening_mistake_review`;--> statement-breakpoint
CREATE TABLE `__new_opening_progress` (
	`user_id` text NOT NULL,
	`opening_id` text NOT NULL,
	`variation_key` text NOT NULL,
	`variation_label` text NOT NULL,
	`attempts_count` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`last_accuracy` real DEFAULT 0 NOT NULL,
	`next_review_date` integer NOT NULL,
	`last_practiced_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `opening_id`, `variation_key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_opening_progress`("user_id", "opening_id", "variation_key", "variation_label", "attempts_count", "streak", "last_accuracy", "next_review_date", "last_practiced_at") SELECT "user_id", "opening_id", "variation_key", "variation_label", "attempts_count", "streak", "last_accuracy", "next_review_date", "last_practiced_at" FROM `opening_progress`;--> statement-breakpoint
DROP TABLE `opening_progress`;--> statement-breakpoint
ALTER TABLE `__new_opening_progress` RENAME TO `opening_progress`;--> statement-breakpoint
CREATE INDEX `opening_progress_due_idx` ON `opening_progress` (`next_review_date`);--> statement-breakpoint
CREATE INDEX `opening_progress_opening_idx` ON `opening_progress` (`opening_id`);--> statement-breakpoint
CREATE TABLE `__new_programme_puzzle_results` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`puzzle_id` text NOT NULL,
	`source_day_key` text NOT NULL,
	`role` text NOT NULL,
	`skeleton_ok` integer NOT NULL,
	`solved` integer NOT NULL,
	`marked_squares` text,
	`seconds` real,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `programme_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_programme_puzzle_results`("id", "session_id", "user_id", "puzzle_id", "source_day_key", "role", "skeleton_ok", "solved", "marked_squares", "seconds", "occurred_at") SELECT "id", "session_id", "user_id", "puzzle_id", "source_day_key", "role", "skeleton_ok", "solved", "marked_squares", "seconds", "occurred_at" FROM `programme_puzzle_results`;--> statement-breakpoint
DROP TABLE `programme_puzzle_results`;--> statement-breakpoint
ALTER TABLE `__new_programme_puzzle_results` RENAME TO `programme_puzzle_results`;--> statement-breakpoint
CREATE INDEX `programme_results_session_idx` ON `programme_puzzle_results` (`session_id`);--> statement-breakpoint
CREATE INDEX `programme_results_user_puzzle_idx` ON `programme_puzzle_results` (`user_id`,`puzzle_id`);--> statement-breakpoint
CREATE TABLE `__new_programme_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`day_key` text NOT NULL,
	`semaine` integer NOT NULL,
	`jour` integer NOT NULL,
	`repetition` integer DEFAULT 0 NOT NULL,
	`rating_offset` integer NOT NULL,
	`plan` text NOT NULL,
	`status` text NOT NULL,
	`attempted` integer DEFAULT 0 NOT NULL,
	`succeeded` integer DEFAULT 0 NOT NULL,
	`retention_passed` integer,
	`checklist` text,
	`reconsolidation` text,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_programme_sessions`("id", "user_id", "day_key", "semaine", "jour", "repetition", "rating_offset", "plan", "status", "attempted", "succeeded", "retention_passed", "checklist", "reconsolidation", "started_at", "completed_at") SELECT "id", "user_id", "day_key", "semaine", "jour", "repetition", "rating_offset", "plan", "status", "attempted", "succeeded", "retention_passed", "checklist", "reconsolidation", "started_at", "completed_at" FROM `programme_sessions`;--> statement-breakpoint
DROP TABLE `programme_sessions`;--> statement-breakpoint
ALTER TABLE `__new_programme_sessions` RENAME TO `programme_sessions`;--> statement-breakpoint
CREATE INDEX `programme_sessions_user_idx` ON `programme_sessions` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `__new_programme_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`semaine` integer NOT NULL,
	`jour` integer NOT NULL,
	`repetition` integer DEFAULT 0 NOT NULL,
	`rating_offset` integer DEFAULT 0 NOT NULL,
	`started_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_programme_state`("user_id", "semaine", "jour", "repetition", "rating_offset", "started_at", "updated_at") SELECT "user_id", "semaine", "jour", "repetition", "rating_offset", "started_at", "updated_at" FROM `programme_state`;--> statement-breakpoint
DROP TABLE `programme_state`;--> statement-breakpoint
ALTER TABLE `__new_programme_state` RENAME TO `programme_state`;--> statement-breakpoint
CREATE TABLE `__new_sparring_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opening_id` text,
	`variation_key` text,
	`policy` text NOT NULL,
	`target_elo` integer,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	`result` text,
	`theory_exit_ply` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sparring_sessions`("id", "user_id", "opening_id", "variation_key", "policy", "target_elo", "started_at", "finished_at", "result", "theory_exit_ply") SELECT "id", "user_id", "opening_id", "variation_key", "policy", "target_elo", "started_at", "finished_at", "result", "theory_exit_ply" FROM `sparring_sessions`;--> statement-breakpoint
DROP TABLE `sparring_sessions`;--> statement-breakpoint
ALTER TABLE `__new_sparring_sessions` RENAME TO `sparring_sessions`;--> statement-breakpoint
CREATE INDEX `sparring_sessions_user_idx` ON `sparring_sessions` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `__new_training_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`entity_id` text NOT NULL,
	`source_game_id` text,
	`score` real,
	`seconds` real,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_training_events`("id", "user_id", "kind", "entity_id", "source_game_id", "score", "seconds", "hints_used", "occurred_at") SELECT "id", "user_id", "kind", "entity_id", "source_game_id", "score", "seconds", "hints_used", "occurred_at" FROM `training_events`;--> statement-breakpoint
DROP TABLE `training_events`;--> statement-breakpoint
ALTER TABLE `__new_training_events` RENAME TO `training_events`;--> statement-breakpoint
CREATE INDEX `training_events_user_time_idx` ON `training_events` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `training_events_entity_idx` ON `training_events` (`kind`,`entity_id`);--> statement-breakpoint
CREATE TABLE `__new_training_recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`reason_code` text NOT NULL,
	`priority` real NOT NULL,
	`due_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_training_recommendations`("id", "user_id", "entity_type", "entity_id", "reason_code", "priority", "due_at", "completed_at") SELECT "id", "user_id", "entity_type", "entity_id", "reason_code", "priority", "due_at", "completed_at" FROM `training_recommendations`;--> statement-breakpoint
DROP TABLE `training_recommendations`;--> statement-breakpoint
ALTER TABLE `__new_training_recommendations` RENAME TO `training_recommendations`;--> statement-breakpoint
CREATE INDEX `training_recommendations_due_idx` ON `training_recommendations` (`user_id`,`due_at`,`completed_at`);--> statement-breakpoint
CREATE INDEX `training_recommendations_entity_idx` ON `training_recommendations` (`user_id`,`entity_type`,`entity_id`);
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
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
	`analysed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_source_external_idx` ON `games` (`source`,`external_id`);--> statement-breakpoint
CREATE INDEX `games_played_at_idx` ON `games` (`played_at`);--> statement-breakpoint
CREATE INDEX `games_eco_idx` ON `games` (`eco`);--> statement-breakpoint
CREATE TABLE `moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	`mate_missed` integer DEFAULT false NOT NULL,
	`motifs` text DEFAULT '[]' NOT NULL,
	`motif_found` integer DEFAULT false NOT NULL,
	`clock_ms` integer,
	`think_seconds` real,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `moves_game_idx` ON `moves` (`game_id`,`ply`);--> statement-breakpoint
CREATE INDEX `moves_quality_idx` ON `moves` (`by_player`,`quality`);--> statement-breakpoint
CREATE INDEX `moves_phase_idx` ON `moves` (`by_player`,`phase`);--> statement-breakpoint
CREATE TABLE `puzzles` (
	`id` text PRIMARY KEY NOT NULL,
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
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `puzzles_deck_idx` ON `puzzles` (`deck`);--> statement-breakpoint
CREATE INDEX `puzzles_game_idx` ON `puzzles` (`game_id`);--> statement-breakpoint
CREATE TABLE `daily_sets` (
	`day` text PRIMARY KEY NOT NULL,
	`puzzle_ids` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	FOREIGN KEY (`puzzle_id`) REFERENCES `puzzles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `review_logs_puzzle_idx` ON `review_logs` (`puzzle_id`);--> statement-breakpoint
CREATE INDEX `review_logs_date_idx` ON `review_logs` (`reviewed_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`puzzle_id` text PRIMARY KEY NOT NULL,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`scheduled_days` integer NOT NULL,
	`learning_steps` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`state` integer DEFAULT 0 NOT NULL,
	`last_review` integer,
	FOREIGN KEY (`puzzle_id`) REFERENCES `puzzles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_due_idx` ON `reviews` (`due`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `sparring_moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`ply` integer NOT NULL,
	`fen_before` text NOT NULL,
	`uci` text NOT NULL,
	`by_player` integer NOT NULL,
	`policy_score` real,
	`think_ms` integer,
	FOREIGN KEY (`session_id`) REFERENCES `sparring_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sparring_moves_session_idx` ON `sparring_moves` (`session_id`,`ply`);--> statement-breakpoint
CREATE TABLE `sparring_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opening_id` text,
	`variation_key` text,
	`policy` text NOT NULL,
	`target_elo` integer,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	`result` text,
	`theory_exit_ply` integer
);
--> statement-breakpoint
CREATE INDEX `sparring_sessions_user_idx` ON `sparring_sessions` (`user_id`,`started_at`);
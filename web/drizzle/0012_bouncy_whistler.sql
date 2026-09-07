CREATE TABLE `bot_game_results` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`bot_profile` text NOT NULL,
	`bot_elo` integer NOT NULL,
	`accuracy` integer,
	`performance_elo` integer NOT NULL,
	`result` text,
	`termination` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bot_game_results_game_idx` ON `bot_game_results` (`game_id`);--> statement-breakpoint
CREATE INDEX `bot_game_results_created_idx` ON `bot_game_results` (`created_at`);
CREATE TABLE `admin_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text,
	`actor_email` text,
	`action` text NOT NULL,
	`target_id` text,
	`target_email` text,
	`detail` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_audit_created_idx` ON `admin_audit` (`created_at`);--> statement-breakpoint
ALTER TABLE `bot_game_results` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `games` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `moves` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `platform_links` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `puzzle_purges` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `puzzles` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `daily_sets` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `review_logs` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `sparring_moves` ADD `user_id` text;
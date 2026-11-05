CREATE TABLE `user_daily_activity` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`active_seconds` integer DEFAULT 0 NOT NULL,
	`sessions_count` integer DEFAULT 0 NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `day`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_daily_activity_day_idx` ON `user_daily_activity` (`day`);--> statement-breakpoint
CREATE TABLE `user_presence` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_seen_at` integer NOT NULL,
	`current_section` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_presence_seen_idx` ON `user_presence` (`last_seen_at`);
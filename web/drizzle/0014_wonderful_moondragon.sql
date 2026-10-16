CREATE TABLE `opening_endurance_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opening_id` text NOT NULL,
	`opening_name` text NOT NULL,
	`variation_key` text NOT NULL,
	`variation_label` text NOT NULL,
	`first_mistake_ply` integer,
	`last_ply` integer NOT NULL,
	`accuracy` real NOT NULL,
	`played_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `opening_endurance_user_time_idx` ON `opening_endurance_sessions` (`user_id`,`played_at`);
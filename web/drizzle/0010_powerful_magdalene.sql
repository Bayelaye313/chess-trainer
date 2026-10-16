CREATE TABLE `training_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`entity_id` text NOT NULL,
	`source_game_id` text,
	`score` real,
	`seconds` real,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`occurred_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `training_events_user_time_idx` ON `training_events` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `training_events_entity_idx` ON `training_events` (`kind`,`entity_id`);--> statement-breakpoint
CREATE TABLE `training_recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`reason_code` text NOT NULL,
	`priority` real NOT NULL,
	`due_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `training_recommendations_due_idx` ON `training_recommendations` (`user_id`,`due_at`,`completed_at`);--> statement-breakpoint
CREATE INDEX `training_recommendations_entity_idx` ON `training_recommendations` (`user_id`,`entity_type`,`entity_id`);
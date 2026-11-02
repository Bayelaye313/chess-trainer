CREATE TABLE `programme_puzzle_results` (
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
	FOREIGN KEY (`session_id`) REFERENCES `programme_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `programme_results_session_idx` ON `programme_puzzle_results` (`session_id`);--> statement-breakpoint
CREATE INDEX `programme_results_user_puzzle_idx` ON `programme_puzzle_results` (`user_id`,`puzzle_id`);--> statement-breakpoint
CREATE TABLE `programme_sessions` (
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
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `programme_sessions_user_idx` ON `programme_sessions` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `programme_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`semaine` integer NOT NULL,
	`jour` integer NOT NULL,
	`repetition` integer DEFAULT 0 NOT NULL,
	`rating_offset` integer DEFAULT 0 NOT NULL,
	`started_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

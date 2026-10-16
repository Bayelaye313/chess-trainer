CREATE TABLE `opening_progress` (
	`user_id` text NOT NULL,
	`opening_id` text NOT NULL,
	`variation_key` text NOT NULL,
	`variation_label` text NOT NULL,
	`attempts_count` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`last_accuracy` real DEFAULT 0 NOT NULL,
	`next_review_date` integer NOT NULL,
	`last_practiced_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `opening_id`, `variation_key`)
);
--> statement-breakpoint
CREATE INDEX `opening_progress_due_idx` ON `opening_progress` (`next_review_date`);--> statement-breakpoint
CREATE INDEX `opening_progress_opening_idx` ON `opening_progress` (`opening_id`);
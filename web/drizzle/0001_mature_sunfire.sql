CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`username` text NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`max_games` integer NOT NULL,
	`games_found` integer,
	`games_processed` integer DEFAULT 0 NOT NULL,
	`games_skipped` integer DEFAULT 0 NOT NULL,
	`mistakes_found` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`started_at` integer NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
CREATE INDEX `import_jobs_started_at_idx` ON `import_jobs` (`started_at`);
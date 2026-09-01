CREATE TABLE `imported_opening_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`family` text NOT NULL,
	`eco` text NOT NULL,
	`moves` text NOT NULL,
	`source_file` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `imported_opening_lines_source_idx` ON `imported_opening_lines` (`source_file`);--> statement-breakpoint
CREATE TABLE `imported_traps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`family` text NOT NULL,
	`gambit` text NOT NULL,
	`eco` text NOT NULL,
	`victim_side` text NOT NULL,
	`difficulty` text NOT NULL,
	`summary` text NOT NULL,
	`setup_moves` text NOT NULL,
	`trap_move` text NOT NULL,
	`trap_explanation` text NOT NULL,
	`hint` text NOT NULL,
	`refutation_moves` text NOT NULL,
	`outcome` text NOT NULL,
	`commentary` text NOT NULL,
	`source_file` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `imported_traps_source_idx` ON `imported_traps` (`source_file`);--> statement-breakpoint
CREATE INDEX `imported_traps_family_idx` ON `imported_traps` (`family`);
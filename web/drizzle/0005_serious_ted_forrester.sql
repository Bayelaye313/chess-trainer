CREATE TABLE `curriculum_puzzles` (
	`id` text PRIMARY KEY NOT NULL,
	`theme_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`fen` text NOT NULL,
	`solution` text NOT NULL,
	`solution_san` text NOT NULL,
	`source_ref` text,
	FOREIGN KEY (`theme_id`) REFERENCES `curriculum_themes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `curriculum_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`author` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`level` text NOT NULL,
	`total_puzzles` integer NOT NULL,
	`order_index` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_theme_progress` (
	`user_id` text NOT NULL,
	`theme_id` text NOT NULL,
	`completed_count` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `theme_id`),
	FOREIGN KEY (`theme_id`) REFERENCES `curriculum_themes`(`id`) ON UPDATE no action ON DELETE cascade
);

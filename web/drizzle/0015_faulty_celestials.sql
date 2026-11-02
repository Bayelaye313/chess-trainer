CREATE TABLE `puzzle_purges` (
	`move_id` integer PRIMARY KEY NOT NULL,
	`game_id` text,
	`fen_before` text NOT NULL,
	`reason` text NOT NULL,
	`purged_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `puzzles` ADD `coach_comment` text;--> statement-breakpoint
ALTER TABLE `puzzles` ADD `alternatives` text;--> statement-breakpoint
ALTER TABLE `puzzles` ADD `audited_at` integer;
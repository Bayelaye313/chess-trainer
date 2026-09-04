ALTER TABLE `curriculum_puzzles` ADD `source_file` text;--> statement-breakpoint
CREATE INDEX `curriculum_puzzles_source_idx` ON `curriculum_puzzles` (`source_file`);
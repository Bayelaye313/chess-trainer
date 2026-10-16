CREATE TABLE `platform_links` (
	`source` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`linked_at` integer NOT NULL,
	`last_synced_at` integer,
	`last_imported_played_at` integer
);

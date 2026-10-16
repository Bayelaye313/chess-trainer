CREATE TABLE `opening_mistake_review` (
	`user_id` text NOT NULL,
	`fen_before` text NOT NULL,
	`actual_uci` text NOT NULL,
	`reviewed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `fen_before`, `actual_uci`)
);

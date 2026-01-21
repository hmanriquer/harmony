CREATE TABLE `daily_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dayIndex` integer NOT NULL,
	`occupancyPercentage` integer DEFAULT 100 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_settings_dayIndex_unique` ON `daily_settings` (`dayIndex`);--> statement-breakpoint
ALTER TABLE `teams` ADD `capacity` integer DEFAULT 0 NOT NULL;
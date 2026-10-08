CREATE TABLE `sales_search_gaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` varchar(10) NOT NULL,
	`intent` enum('steel','silver','gold','wedding','engagement','promise','solitaire','men','sizing','other') NOT NULL,
	`count` int unsigned NOT NULL DEFAULT 1,
	CONSTRAINT `sales_search_gaps_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_search_gaps_day_intent_unique` UNIQUE(`day`,`intent`)
);
--> statement-breakpoint
CREATE TABLE `sales_workspace` (
	`id` int NOT NULL,
	`revision` int unsigned NOT NULL,
	`payload` json NOT NULL,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_workspace_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_workspace_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revision` int unsigned NOT NULL,
	`actor_user_id` int,
	`kind` enum('save','undo','delete') NOT NULL,
	`changes` json NOT NULL,
	`before_payload` json,
	`after_payload` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_workspace_audit_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_workspace_audit_revision_unique` UNIQUE(`revision`)
);
--> statement-breakpoint
ALTER TABLE `product_images` ADD `focal_point_x` int;--> statement-breakpoint
ALTER TABLE `product_images` ADD `focal_point_y` int;
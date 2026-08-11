CREATE TABLE `checklist_records` (
	`id` text PRIMARY KEY NOT NULL,
	`oferente` text NOT NULL,
	`municipio` text NOT NULL,
	`checks` text NOT NULL,
	`observations` text DEFAULT '' NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

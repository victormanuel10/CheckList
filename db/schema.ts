import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ChecklistStatus, DeliveryStatus } from "../lib/checklist-data";

export const checklistRecords = sqliteTable("checklist_records", {
  id: text("id").primaryKey(),
  oferente: text("oferente").notNull(),
  municipio: text("municipio").notNull(),
  deliveryStatus: text("delivery_status")
    .$type<DeliveryStatus>()
    .notNull()
    .default("Sin registrar"),
  checks: text("checks", { mode: "json" })
    .$type<Record<string, ChecklistStatus>>()
    .notNull(),
  observations: text("observations").notNull().default(""),
  updatedAt: text("updated_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

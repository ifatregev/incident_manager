import { sql } from "drizzle-orm";
import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const incident = pgTable(
  "incident",
  {
    id: serial("id").primaryKey(),
    title: text("title"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    slackStart: timestamp("slack_start", { withTimezone: true }).notNull(),
    slackEnd: timestamp("slack_end", { withTimezone: true }),
    ownerName: text("owner_name"),
    severity: text("severity"),
    slackChannelId: text("slack_channel_id").notNull(),
    service: text("service"),
    detectedAt: timestamp("detected_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    affectedSystems: text("affected_systems").array(),
    actionItems: text("action_items").array(),
    rootCause: text("root_cause"),
  },
  (table) => [
    index("incident_open_channel_idx")
      .on(table.slackChannelId)
      .where(sql`${table.slackEnd} is null`),
  ]
);

export const incidentUpdate = pgTable("incident_update", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id")
    .notNull()
    .references(() => incident.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  description: text("description").notNull(),
  ownerName: text("owner_name"),
});

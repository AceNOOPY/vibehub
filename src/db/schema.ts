import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ProjectDocument } from "./project-document";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  document: jsonb("document").$type<ProjectDocument>().notNull(),
  revision: integer("revision").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
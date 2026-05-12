import { timestamp } from "drizzle-orm/pg-core";

/**
 * Common audit columns for all tables.
 * Includes createdAt, updatedAt, and deletedAt for soft deletes.
 */
export const auditColumns = {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
};

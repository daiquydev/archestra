import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { auditColumns } from "../utils/audit";


const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
    ...auditColumns,
  });

export default verification;

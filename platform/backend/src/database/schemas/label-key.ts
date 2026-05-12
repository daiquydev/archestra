import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditColumns } from "../utils/audit";


const labelKeyTable = pgTable("label_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date",
    ...auditColumns,
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export default labelKeyTable;

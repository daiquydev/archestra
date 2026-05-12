import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditColumns } from "../utils/audit";


const labelValueTable = pgTable("label_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: text("value").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date",
    ...auditColumns,
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export default labelValueTable;

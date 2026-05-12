import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { auditColumns } from "../utils/audit";


const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),

  expiresAt: timestamp("expires_at"),
    ...auditColumns,
  });

export default jwks;

import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import mcpServerTable from "./mcp-server";
import usersTable from "./user";
import { auditColumns } from "../utils/audit";


/**
 * McpServerUser table - many-to-many relationship between MCP servers and users
 * For user-based (personal) authorization of MCP server installations
 */
const mcpServerUserTable = pgTable(
  "mcp_server_user",
  {
    mcpServerId: uuid("mcp_server_id")
      .notNull()
      .references(() => mcpServerTable.id, { onDelete: "cascade",
    ...auditColumns,
  }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.mcpServerId, table.userId] }),
  }),
);

export default mcpServerUserTable;

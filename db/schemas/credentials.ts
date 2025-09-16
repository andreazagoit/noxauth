import {pgTable, serial, text, timestamp, uuid} from "drizzle-orm/pg-core";
import {InferSelectModel, InferInsertModel} from "drizzle-orm";
import {users} from "./users";

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, {onDelete: "cascade"})
    .notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Credential = InferSelectModel<typeof credentials>;
export type NewCredential = InferInsertModel<typeof credentials>;

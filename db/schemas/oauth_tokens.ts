import {pgTable, uuid, text, timestamp} from "drizzle-orm/pg-core";
import {InferSelectModel, InferInsertModel} from "drizzle-orm";
import {users} from "./users";
import {oauthClients} from "./oauth_clients";

export const oauthTokens = pgTable("oauth_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  accessToken: text("access_token").notNull().unique(),
  refreshToken: text("refresh_token").unique(),
  clientId: uuid("client_id")
    .references(() => oauthClients.id, {onDelete: "cascade"})
    .notNull(),
  userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}),
  scopes: text("scopes").notNull(), // JSON array as string
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OAuthToken = InferSelectModel<typeof oauthTokens>;
export type NewOAuthToken = InferInsertModel<typeof oauthTokens>;

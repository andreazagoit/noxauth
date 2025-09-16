import {pgTable, uuid, text, timestamp} from "drizzle-orm/pg-core";
import {InferSelectModel, InferInsertModel} from "drizzle-orm";
import {users} from "./users";
import {oauthClients} from "./oauth_clients";

export const oauthCodes = pgTable("oauth_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  clientId: uuid("client_id")
    .references(() => oauthClients.id, {onDelete: "cascade"})
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, {onDelete: "cascade"})
    .notNull(),
  redirectUri: text("redirect_uri").notNull(),
  scopes: text("scopes").notNull(), // JSON array as string
  codeChallenge: text("code_challenge"), // For PKCE
  codeChallengeMethod: text("code_challenge_method"), // For PKCE
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OAuthCode = InferSelectModel<typeof oauthCodes>;
export type NewOAuthCode = InferInsertModel<typeof oauthCodes>;

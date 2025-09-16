import {pgTable, uuid, text, timestamp, boolean} from "drizzle-orm/pg-core";
import {InferSelectModel, InferInsertModel} from "drizzle-orm";

export const oauthClients = pgTable("oauth_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  name: text("name").notNull(),
  redirectUris: text("redirect_uris").notNull(), // JSON array as string
  scopes: text("scopes").notNull(), // JSON array as string
  grantTypes: text("grant_types").notNull(), // JSON array as string
  isConfidential: boolean("is_confidential").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OAuthClient = InferSelectModel<typeof oauthClients>;
export type NewOAuthClient = InferInsertModel<typeof oauthClients>;

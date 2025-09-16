import {eq, and, lt} from "drizzle-orm";
import db from "../db";
import {
  oauthClients,
  oauthCodes,
  oauthTokens,
  type OAuthClient,
  type NewOAuthClient,
  type OAuthCode,
  type NewOAuthCode,
  type OAuthToken,
  type NewOAuthToken,
} from "../db/schemas";

// OAuth Client queries
export async function createOAuthClient(
  clientData: NewOAuthClient
): Promise<OAuthClient> {
  const [client] = await db.insert(oauthClients).values(clientData).returning();
  return client;
}

export async function getOAuthClientById(
  id: string
): Promise<OAuthClient | null> {
  const [client] = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.id, id));
  return client || null;
}

export async function getOAuthClientByClientId(
  clientId: string
): Promise<OAuthClient | null> {
  const [client] = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.clientId, clientId));
  return client || null;
}

export async function getAllOAuthClients(): Promise<OAuthClient[]> {
  return await db.select().from(oauthClients);
}

// OAuth Code queries
export async function createOAuthCode(
  codeData: NewOAuthCode
): Promise<OAuthCode> {
  const [code] = await db.insert(oauthCodes).values(codeData).returning();
  return code;
}

export async function getOAuthCodeByCode(
  code: string
): Promise<OAuthCode | null> {
  const [authCode] = await db
    .select()
    .from(oauthCodes)
    .where(eq(oauthCodes.code, code));
  return authCode || null;
}

export async function deleteOAuthCode(code: string): Promise<void> {
  await db.delete(oauthCodes).where(eq(oauthCodes.code, code));
}

export async function cleanupExpiredCodes(): Promise<void> {
  await db.delete(oauthCodes).where(lt(oauthCodes.expiresAt, new Date()));
}

// OAuth Token queries
export async function createOAuthToken(
  tokenData: NewOAuthToken
): Promise<OAuthToken> {
  const [token] = await db.insert(oauthTokens).values(tokenData).returning();
  return token;
}

export async function getOAuthTokenByAccessToken(
  accessToken: string
): Promise<OAuthToken | null> {
  const [token] = await db
    .select()
    .from(oauthTokens)
    .where(eq(oauthTokens.accessToken, accessToken));
  return token || null;
}

export async function getOAuthTokenByRefreshToken(
  refreshToken: string
): Promise<OAuthToken | null> {
  const [token] = await db
    .select()
    .from(oauthTokens)
    .where(eq(oauthTokens.refreshToken, refreshToken));
  return token || null;
}

export async function deleteOAuthToken(accessToken: string): Promise<void> {
  await db.delete(oauthTokens).where(eq(oauthTokens.accessToken, accessToken));
}

export async function deleteOAuthTokenByRefreshToken(
  refreshToken: string
): Promise<void> {
  await db
    .delete(oauthTokens)
    .where(eq(oauthTokens.refreshToken, refreshToken));
}

export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  await db.delete(oauthTokens).where(lt(oauthTokens.accessTokenExpiresAt, now));
}

// Get tokens for user and client
export async function getOAuthTokensForUserAndClient(
  userId: string,
  clientId: string
): Promise<OAuthToken[]> {
  const client = await getOAuthClientByClientId(clientId);
  if (!client) return [];

  return await db
    .select()
    .from(oauthTokens)
    .where(
      and(eq(oauthTokens.userId, userId), eq(oauthTokens.clientId, client.id))
    );
}

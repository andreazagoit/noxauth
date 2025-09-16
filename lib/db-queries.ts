import {eq, and} from "drizzle-orm";
import db from "../db";
import {
  users,
  credentials,
  oauthAccounts,
  type User,
  type NewUser,
  type NewCredential,
  type NewOAuthAccount,
} from "../db/schemas";

// User queries
export async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

// Credential queries
export async function createCredential(
  credentialData: NewCredential
): Promise<void> {
  await db.insert(credentials).values(credentialData);
}

export async function getUserWithCredentials(email: string) {
  const result = await db
    .select({
      user: users,
      credential: credentials,
    })
    .from(users)
    .leftJoin(credentials, eq(users.id, credentials.userId))
    .where(eq(users.email, email));

  if (result.length === 0) return null;

  const {user, credential} = result[0];
  return {user, credential};
}

// OAuth account queries
export async function createOAuthAccount(
  accountData: NewOAuthAccount
): Promise<void> {
  await db.insert(oauthAccounts).values(accountData);
}

export async function getOAuthAccount(
  provider: string,
  providerAccountId: string
) {
  const [account] = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId)
      )
    );

  return account || null;
}

export async function getUserByOAuthAccount(
  provider: string,
  providerAccountId: string
) {
  const result = await db
    .select({
      user: users,
      account: oauthAccounts,
    })
    .from(oauthAccounts)
    .innerJoin(users, eq(oauthAccounts.userId, users.id))
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId)
      )
    );

  if (result.length === 0) return null;

  const {user, account} = result[0];
  return {user, account};
}

// Additional user queries for credentials
export async function getUserBySlug(slug: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.slug, slug));
  return user || null;
}

export async function updateUser(
  id: string,
  updates: Partial<NewUser>
): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

export async function verifyUserEmail(id: string): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set({emailVerified: new Date()})
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

export async function setUserSlug(
  id: string,
  slug: string
): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set({slug})
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

export async function getCredentialByUserId(userId: string) {
  const [credential] = await db
    .select()
    .from(credentials)
    .where(eq(credentials.userId, userId));
  return credential || null;
}

export async function updateCredential(userId: string, passwordHash: string) {
  const [credential] = await db
    .update(credentials)
    .set({passwordHash})
    .where(eq(credentials.userId, userId))
    .returning();
  return credential || null;
}

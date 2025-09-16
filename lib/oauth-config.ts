export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  redirectUri: string;
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    id: "google",
    name: "Google",
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
    redirectUri: `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/auth/callback/google`,
  },
  github: {
    id: "github",
    name: "GitHub",
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scope: "user:email",
    redirectUri: `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/auth/callback/github`,
  },
};

export function getOAuthProvider(providerId: string): OAuthProvider | null {
  return oauthProviders[providerId] || null;
}

export function buildAuthorizationUrl(
  provider: OAuthProvider,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scope,
    response_type: "code",
    state,
  });

  return `${provider.authorizationUrl}?${params.toString()}`;
}

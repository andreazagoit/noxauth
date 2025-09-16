import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// OAuth 2.0 Token Types
export interface OAuth2TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface OAuth2AccessToken {
  sub: string; // User ID
  client_id: string;
  scope: string[];
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

export interface OAuth2RefreshToken {
  sub: string; // User ID
  client_id: string;
  scope: string[];
  exp: number;
  iat: number;
  token_type: "refresh";
}

// Generate OAuth 2.0 compliant tokens
export function generateOAuth2Tokens(
  userId: string,
  clientId: string,
  scopes: string[],
  issuer: string = "https://noxauth.example.com"
): OAuth2TokenResponse {
  const now = Math.floor(Date.now() / 1000);
  const accessTokenExpiry = 3600; // 1 hour
  const refreshTokenExpiry = 7776000; // 90 days

  // Access Token (JWT)
  const accessTokenPayload: OAuth2AccessToken = {
    sub: userId,
    client_id: clientId,
    scope: scopes,
    exp: now + accessTokenExpiry,
    iat: now,
    iss: issuer,
    aud: clientId,
  };

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET);

  // Refresh Token (JWT)
  const refreshTokenPayload: OAuth2RefreshToken = {
    sub: userId,
    client_id: clientId,
    scope: scopes,
    exp: now + refreshTokenExpiry,
    iat: now,
    token_type: "refresh",
  };

  const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET);

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: accessTokenExpiry,
    refresh_token: refreshToken,
    scope: scopes.join(" "),
  };
}

// Verify OAuth 2.0 Access Token
export function verifyOAuth2AccessToken(
  token: string
): OAuth2AccessToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as OAuth2AccessToken;

    // Verify it's an access token (not refresh)
    if (!decoded.sub || !decoded.client_id || !decoded.scope) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

// Verify OAuth 2.0 Refresh Token
export function verifyOAuth2RefreshToken(
  token: string
): OAuth2RefreshToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as OAuth2RefreshToken;

    // Verify it's a refresh token
    if (
      decoded.token_type !== "refresh" ||
      !decoded.sub ||
      !decoded.client_id
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

// Generate authorization code
export function generateAuthorizationCode(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// Generate client credentials
export function generateClientCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomBytes(32).toString("base64url");

  return {clientId, clientSecret};
}

// Validate redirect URI
export function validateRedirectUri(
  uri: string,
  allowedUris: string[]
): boolean {
  return allowedUris.includes(uri);
}

// Validate scope
export function validateScopes(
  requestedScopes: string[],
  allowedScopes: string[]
): boolean {
  return requestedScopes.every((scope) => allowedScopes.includes(scope));
}

// Parse scope string to array
export function parseScopes(scopeString: string): string[] {
  return scopeString ? scopeString.split(" ").filter(Boolean) : [];
}

// PKCE utilities
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function verifyCodeChallenge(
  verifier: string,
  challenge: string,
  method: string = "S256"
): boolean {
  if (method === "S256") {
    const computedChallenge = generateCodeChallenge(verifier);
    return computedChallenge === challenge;
  } else if (method === "plain") {
    return verifier === challenge;
  }
  return false;
}

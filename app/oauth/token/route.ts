import {NextRequest, NextResponse} from "next/server";
import {
  getOAuthClientByClientId,
  getOAuthCodeByCode,
  deleteOAuthCode,
  createOAuthToken,
  getOAuthTokenByRefreshToken,
  deleteOAuthTokenByRefreshToken,
} from "@/lib/oauth2-queries";
import {getUserById} from "@/lib/db-queries";
import {
  generateOAuth2Tokens,
  verifyOAuth2RefreshToken,
  parseScopes,
  verifyCodeChallenge,
} from "@/lib/oauth2-utils";

// OAuth 2.0 Token Endpoint
// POST /oauth/token
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();

    const grantType = body.get("grant_type") as string;
    const clientId = body.get("client_id") as string;
    const clientSecret = body.get("client_secret") as string;

    // Validate required parameters
    if (!grantType || !clientId) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description:
            "Missing required parameters: grant_type, client_id",
        },
        {status: 400}
      );
    }

    // Validate client
    const client = await getOAuthClientByClientId(clientId);
    if (!client) {
      return NextResponse.json(
        {
          error: "invalid_client",
          error_description: "Invalid client_id",
        },
        {status: 400}
      );
    }

    // Validate client secret for confidential clients
    if (client.isConfidential && client.clientSecret !== clientSecret) {
      return NextResponse.json(
        {
          error: "invalid_client",
          error_description: "Invalid client_secret",
        },
        {status: 401}
      );
    }

    // Handle different grant types
    if (grantType === "authorization_code") {
      return await handleAuthorizationCodeGrant(request, body, client);
    } else if (grantType === "refresh_token") {
      return await handleRefreshTokenGrant(request, body, client);
    } else if (grantType === "client_credentials") {
      return await handleClientCredentialsGrant(request, body, client);
    } else {
      return NextResponse.json(
        {
          error: "unsupported_grant_type",
          error_description: `Grant type '${grantType}' is not supported`,
        },
        {status: 400}
      );
    }
  } catch (error) {
    console.error("OAuth token error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Internal server error",
      },
      {status: 500}
    );
  }
}

// Authorization Code Grant
async function handleAuthorizationCodeGrant(
  request: NextRequest,
  body: FormData,
  client: any
) {
  const code = body.get("code") as string;
  const redirectUri = body.get("redirect_uri") as string;
  const codeVerifier = body.get("code_verifier") as string; // PKCE

  if (!code || !redirectUri) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters: code, redirect_uri",
      },
      {status: 400}
    );
  }

  // Get and validate authorization code
  const authCode = await getOAuthCodeByCode(code);
  if (!authCode) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code",
      },
      {status: 400}
    );
  }

  // Check if code is expired
  if (authCode.expiresAt < new Date()) {
    await deleteOAuthCode(code);
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Authorization code has expired",
      },
      {status: 400}
    );
  }

  // Validate client and redirect URI
  if (authCode.clientId !== client.id || authCode.redirectUri !== redirectUri) {
    await deleteOAuthCode(code);
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid client or redirect_uri for this code",
      },
      {status: 400}
    );
  }

  // Validate PKCE if present
  if (authCode.codeChallenge && !codeVerifier) {
    await deleteOAuthCode(code);
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "code_verifier required for PKCE",
      },
      {status: 400}
    );
  }

  if (authCode.codeChallenge && codeVerifier) {
    const isValidChallenge = verifyCodeChallenge(
      codeVerifier,
      authCode.codeChallenge,
      authCode.codeChallengeMethod || "S256"
    );

    if (!isValidChallenge) {
      await deleteOAuthCode(code);
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Invalid code_verifier",
        },
        {status: 400}
      );
    }
  }

  // Get user
  const user = await getUserById(authCode.userId);
  if (!user) {
    await deleteOAuthCode(code);
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "User not found",
      },
      {status: 400}
    );
  }

  // Generate tokens
  const scopes = JSON.parse(authCode.scopes) as string[];
  const tokenResponse = generateOAuth2Tokens(user.id, clientId, scopes);

  // Store token in database
  const tokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
  const refreshTokenExpiresAt = new Date(Date.now() + 7776000 * 1000); // 90 days

  await createOAuthToken({
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token!,
    clientId: client.id,
    userId: user.id,
    scopes: JSON.stringify(scopes),
    accessTokenExpiresAt: tokenExpiresAt,
    refreshTokenExpiresAt: refreshTokenExpiresAt,
  });

  // Delete used authorization code
  await deleteOAuthCode(code);

  return NextResponse.json(tokenResponse);
}

// Refresh Token Grant
async function handleRefreshTokenGrant(
  request: NextRequest,
  body: FormData,
  client: any
) {
  const refreshToken = body.get("refresh_token") as string;
  const scope = body.get("scope") as string;

  if (!refreshToken) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameter: refresh_token",
      },
      {status: 400}
    );
  }

  // Verify refresh token
  const tokenData = verifyOAuth2RefreshToken(refreshToken);
  if (!tokenData) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid or expired refresh token",
      },
      {status: 400}
    );
  }

  // Validate client
  if (tokenData.client_id !== client.clientId) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Refresh token was not issued to this client",
      },
      {status: 400}
    );
  }

  // Get stored token
  const storedToken = await getOAuthTokenByRefreshToken(refreshToken);
  if (!storedToken) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Refresh token not found",
      },
      {status: 400}
    );
  }

  // Validate scope (requested scope must not exceed original scope)
  let scopes = tokenData.scope;
  if (scope) {
    const requestedScopes = parseScopes(scope);
    const originalScopes = JSON.parse(storedToken.scopes) as string[];

    if (!requestedScopes.every((s) => originalScopes.includes(s))) {
      return NextResponse.json(
        {
          error: "invalid_scope",
          error_description: "Requested scope exceeds original scope",
        },
        {status: 400}
      );
    }
    scopes = requestedScopes;
  }

  // Generate new tokens
  const tokenResponse = generateOAuth2Tokens(
    tokenData.sub,
    client.clientId,
    scopes
  );

  // Update stored token
  const tokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
  const refreshTokenExpiresAt = new Date(Date.now() + 7776000 * 1000); // 90 days

  // Delete old token and create new one
  await deleteOAuthTokenByRefreshToken(refreshToken);
  await createOAuthToken({
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token!,
    clientId: client.id,
    userId: tokenData.sub,
    scopes: JSON.stringify(scopes),
    accessTokenExpiresAt: tokenExpiresAt,
    refreshTokenExpiresAt: refreshTokenExpiresAt,
  });

  return NextResponse.json(tokenResponse);
}

// Client Credentials Grant
async function handleClientCredentialsGrant(
  request: NextRequest,
  body: FormData,
  client: any
) {
  const scope = (body.get("scope") as string) || "";

  // Validate that this is a confidential client
  if (!client.isConfidential) {
    return NextResponse.json(
      {
        error: "unauthorized_client",
        error_description:
          "Client credentials grant requires a confidential client",
      },
      {status: 400}
    );
  }

  // Validate scopes
  const requestedScopes = parseScopes(scope);
  const allowedScopes = JSON.parse(client.scopes) as string[];

  if (!requestedScopes.every((s) => allowedScopes.includes(s))) {
    return NextResponse.json(
      {
        error: "invalid_scope",
        error_description: "Invalid or unauthorized scope",
      },
      {status: 400}
    );
  }

  // Generate access token (no refresh token for client credentials)
  const tokenResponse = generateOAuth2Tokens(
    client.clientId,
    client.clientId,
    requestedScopes
  );

  // Remove refresh token for client credentials grant
  const {refresh_token, ...clientCredentialsResponse} = tokenResponse;

  // Store token in database
  const tokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  await createOAuthToken({
    accessToken: clientCredentialsResponse.access_token,
    clientId: client.id,
    userId: null, // No user for client credentials
    scopes: JSON.stringify(requestedScopes),
    accessTokenExpiresAt: tokenExpiresAt,
  });

  return NextResponse.json(clientCredentialsResponse);
}

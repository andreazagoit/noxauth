import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getOAuthClientByClientId, createOAuthCode} from "@/lib/oauth2-queries";
import {getUserById} from "@/lib/db-queries";
import {verifyAccessToken} from "@/lib/auth";
import {
  generateAuthorizationCode,
  validateRedirectUri,
  validateScopes,
  parseScopes,
} from "@/lib/oauth2-utils";

// OAuth 2.0 Authorization Endpoint
// GET /oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);

    const responseType = searchParams.get("response_type");
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const scope = searchParams.get("scope") || "";
    const state = searchParams.get("state");
    const codeChallenge = searchParams.get("code_challenge"); // PKCE
    const codeChallengeMethod =
      searchParams.get("code_challenge_method") || "S256";

    // Validate required parameters
    if (!responseType || !clientId || !redirectUri) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description:
            "Missing required parameters: response_type, client_id, redirect_uri",
        },
        {status: 400}
      );
    }

    // Only support authorization code flow
    if (responseType !== "code") {
      return NextResponse.json(
        {
          error: "unsupported_response_type",
          error_description: "Only 'code' response type is supported",
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

    // Validate redirect URI
    const allowedRedirectUris = JSON.parse(client.redirectUris) as string[];
    if (!validateRedirectUri(redirectUri, allowedRedirectUris)) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description: "Invalid redirect_uri",
        },
        {status: 400}
      );
    }

    // Validate scopes
    const requestedScopes = parseScopes(scope);
    const allowedScopes = JSON.parse(client.scopes) as string[];
    if (!validateScopes(requestedScopes, allowedScopes)) {
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set("error", "invalid_scope");
      errorUrl.searchParams.set(
        "error_description",
        "Invalid or unauthorized scope"
      );
      if (state) errorUrl.searchParams.set("state", state);

      return NextResponse.redirect(errorUrl.toString());
    }

    // Check if user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      // Redirect to login with OAuth context
      const loginUrl = new URL("/oauth/login", request.url);
      loginUrl.searchParams.set("client_id", clientId);
      loginUrl.searchParams.set("redirect_uri", redirectUri);
      loginUrl.searchParams.set("scope", scope);
      loginUrl.searchParams.set("response_type", responseType);
      if (state) loginUrl.searchParams.set("state", state);
      if (codeChallenge)
        loginUrl.searchParams.set("code_challenge", codeChallenge);
      if (codeChallengeMethod)
        loginUrl.searchParams.set("code_challenge_method", codeChallengeMethod);

      return NextResponse.redirect(loginUrl.toString());
    }

    // Verify token and get user
    const tokenData = verifyAccessToken(token);
    if (!tokenData?.user) {
      // Invalid token, redirect to login
      const loginUrl = new URL("/oauth/login", request.url);
      loginUrl.searchParams.set("client_id", clientId);
      loginUrl.searchParams.set("redirect_uri", redirectUri);
      loginUrl.searchParams.set("scope", scope);
      loginUrl.searchParams.set("response_type", responseType);
      if (state) loginUrl.searchParams.set("state", state);

      return NextResponse.redirect(loginUrl.toString());
    }

    const user = tokenData.user as {id: string};
    const fullUser = await getUserById(user.id);

    if (!fullUser) {
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set("error", "access_denied");
      errorUrl.searchParams.set("error_description", "User not found");
      if (state) errorUrl.searchParams.set("state", state);

      return NextResponse.redirect(errorUrl.toString());
    }

    // Generate authorization code
    const authCode = generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code
    await createOAuthCode({
      code: authCode,
      clientId: client.id,
      userId: fullUser.id,
      redirectUri,
      scopes: JSON.stringify(requestedScopes),
      codeChallenge,
      codeChallengeMethod,
      expiresAt,
    });

    // Redirect back to client with authorization code
    const successUrl = new URL(redirectUri);
    successUrl.searchParams.set("code", authCode);
    if (state) successUrl.searchParams.set("state", state);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error("OAuth authorize error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Internal server error",
      },
      {status: 500}
    );
  }
}

import {NextRequest, NextResponse} from "next/server";
import {verifyOAuth2AccessToken} from "@/lib/oauth2-utils";
import {getUserById} from "@/lib/db-queries";
import {getOAuthTokenByAccessToken} from "@/lib/oauth2-queries";

// OAuth 2.0 UserInfo Endpoint
// GET /oauth/userinfo
// Authorization: Bearer <access_token>
export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description: "Missing or invalid Authorization header",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="OAuth2"',
          },
        }
      );
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer "

    // Verify access token
    const tokenData = verifyOAuth2AccessToken(accessToken);
    if (!tokenData) {
      return NextResponse.json(
        {
          error: "invalid_token",
          error_description: "Invalid or expired access token",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="OAuth2", error="invalid_token"',
          },
        }
      );
    }

    // Check if token exists in database (not revoked)
    const storedToken = await getOAuthTokenByAccessToken(accessToken);
    if (!storedToken) {
      return NextResponse.json(
        {
          error: "invalid_token",
          error_description: "Token not found or revoked",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="OAuth2", error="invalid_token"',
          },
        }
      );
    }

    // Check if token is expired
    if (storedToken.accessTokenExpiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "invalid_token",
          error_description: "Access token has expired",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="OAuth2", error="invalid_token"',
          },
        }
      );
    }

    // Get user information
    const user = await getUserById(tokenData.sub);
    if (!user) {
      return NextResponse.json(
        {
          error: "invalid_token",
          error_description: "User not found",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="OAuth2", error="invalid_token"',
          },
        }
      );
    }

    // Get authorized scopes
    const authorizedScopes = JSON.parse(storedToken.scopes) as string[];

    // Build user info response based on scopes
    const userInfo: Record<string, any> = {
      sub: user.id, // Subject (user ID) is always included
    };

    // Add profile information if 'profile' scope is authorized
    if (authorizedScopes.includes("profile")) {
      userInfo.name = user.name;
      userInfo.given_name = user.firstName;
      userInfo.family_name = user.lastName;
      userInfo.nickname = user.slug;
      userInfo.picture = user.image;
      userInfo.profile = user.slug
        ? `https://noxauth.example.com/users/${user.slug}`
        : null;
      userInfo.updated_at = Math.floor(
        new Date(user.updatedAt).getTime() / 1000
      );
    }

    // Add email information if 'email' scope is authorized
    if (authorizedScopes.includes("email")) {
      userInfo.email = user.email;
      userInfo.email_verified = !!user.emailVerified;
    }

    // Add custom user type and role if 'user_info' scope is authorized
    if (authorizedScopes.includes("user_info")) {
      userInfo.user_type = user.type;
      userInfo.role = user.role;
      userInfo.bio = user.bio;
    }

    // Add read/write permissions info if relevant scopes are authorized
    const permissions: string[] = [];
    if (authorizedScopes.includes("read")) permissions.push("read");
    if (authorizedScopes.includes("write")) permissions.push("write");
    if (permissions.length > 0) {
      userInfo.permissions = permissions;
    }

    return NextResponse.json(userInfo, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("OAuth userinfo error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Internal server error",
      },
      {status: 500}
    );
  }
}

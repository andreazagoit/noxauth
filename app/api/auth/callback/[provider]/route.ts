import {NextRequest, NextResponse} from "next/server";
import {getOAuthProvider} from "@/lib/oauth-config";
import {generateTokens} from "@/lib/auth";
import {
  getUserByOAuthAccount,
  createUser,
  createOAuthAccount,
  getUserByEmail,
} from "@/lib/db-queries";
import {cookies} from "next/headers";

interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

async function exchangeCodeForToken(
  provider: any,
  code: string
): Promise<{access_token: string; token_type: string}> {
  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: provider.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

async function fetchUserInfo(
  provider: any,
  accessToken: string
): Promise<OAuthUserInfo> {
  const response = await fetch(provider.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await response.json();

  // Normalize user data based on provider
  switch (provider.id) {
    case "google":
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    case "github":
      return {
        id: data.id.toString(),
        email: data.email,
        name: data.name || data.login,
        picture: data.avatar_url,
      };
    default:
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture || data.avatar_url,
      };
  }
}

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{provider: string}>}
) {
  try {
    const {provider: providerId} = await params;
    const {searchParams} = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json({error: "No code provided"}, {status: 400});
    }

    const provider = getOAuthProvider(providerId);
    if (!provider) {
      return NextResponse.json({error: "Provider not found"}, {status: 404});
    }

    // Verify state parameter
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${providerId}`)?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.json(
        {error: "Invalid state parameter"},
        {status: 400}
      );
    }

    // Clear the state cookie
    cookieStore.delete(`oauth_state_${providerId}`);

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(provider, code);

    // Fetch user info
    const userInfo = await fetchUserInfo(provider, tokenData.access_token);

    // Check if user already exists with this OAuth account
    let userAccount = await getUserByOAuthAccount(providerId, userInfo.id);
    let user = userAccount?.user;

    if (!user) {
      // Check if user exists with this email
      user = await getUserByEmail(userInfo.email);

      if (!user) {
        // Create new user
        user = await createUser({
          name: userInfo.name,
          email: userInfo.email,
          emailVerified: new Date(), // OAuth accounts are pre-verified
          image: userInfo.picture,
        });
      }

      // Create OAuth account link
      await createOAuthAccount({
        userId: user.id,
        provider: providerId,
        providerAccountId: userInfo.id,
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
      });
    }

    // Generate JWT tokens
    const {accessToken, refreshToken} = generateTokens({
      userId: user.id,
      email: user.email,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
      },
    });

    // Create response
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard`
    );

    // Set cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/error`
    );
  }
}

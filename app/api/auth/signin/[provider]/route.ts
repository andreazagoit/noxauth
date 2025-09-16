import {NextRequest, NextResponse} from "next/server";
import {getOAuthProvider, buildAuthorizationUrl} from "@/lib/oauth-config";
import {cookies} from "next/headers";

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{provider: string}>}
) {
  try {
    const {provider: providerId} = await params;

    const provider = getOAuthProvider(providerId);
    if (!provider) {
      return NextResponse.json({error: "Provider not found"}, {status: 404});
    }

    // Generate a state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in cookie for verification
    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${providerId}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    // Build authorization URL
    const authUrl = buildAuthorizationUrl(provider, state);

    // Redirect to OAuth provider
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("OAuth signin error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

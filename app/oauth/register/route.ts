import {NextRequest, NextResponse} from "next/server";
import {createOAuthClient} from "@/lib/oauth2-queries";
import {generateClientCredentials} from "@/lib/oauth2-utils";

// OAuth 2.0 Dynamic Client Registration (RFC 7591)
// POST /oauth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      client_name,
      redirect_uris,
      grant_types = ["authorization_code", "refresh_token"],
      response_types = ["code"],
      scope = "read profile email",
      token_endpoint_auth_method = "client_secret_basic",
      application_type = "web",
    } = body;

    // Validate required fields
    if (!client_name || !redirect_uris || !Array.isArray(redirect_uris)) {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description:
            "client_name and redirect_uris (array) are required",
        },
        {status: 400}
      );
    }

    // Validate redirect URIs
    for (const uri of redirect_uris) {
      try {
        const url = new URL(uri);
        // For security, only allow HTTPS URIs (except localhost for development)
        if (url.protocol !== "https:" && !url.hostname.includes("localhost")) {
          return NextResponse.json(
            {
              error: "invalid_redirect_uri",
              error_description:
                "Only HTTPS redirect URIs are allowed (except localhost)",
            },
            {status: 400}
          );
        }
      } catch {
        return NextResponse.json(
          {
            error: "invalid_redirect_uri",
            error_description: `Invalid redirect URI: ${uri}`,
          },
          {status: 400}
        );
      }
    }

    // Validate grant types
    const allowedGrantTypes = [
      "authorization_code",
      "refresh_token",
      "client_credentials",
    ];
    if (
      !grant_types.every((type: string) => allowedGrantTypes.includes(type))
    ) {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description:
            "Invalid grant_types. Allowed: " + allowedGrantTypes.join(", "),
        },
        {status: 400}
      );
    }

    // Validate response types
    const allowedResponseTypes = ["code"];
    if (
      !response_types.every((type: string) =>
        allowedResponseTypes.includes(type)
      )
    ) {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description:
            "Invalid response_types. Allowed: " +
            allowedResponseTypes.join(", "),
        },
        {status: 400}
      );
    }

    // Parse and validate scopes
    const requestedScopes = scope.split(" ").filter(Boolean);
    const allowedScopes = [
      "read",
      "write",
      "profile",
      "email",
      "user_info",
      "openid",
    ];
    if (!requestedScopes.every((s) => allowedScopes.includes(s))) {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description:
            "Invalid scope. Allowed: " + allowedScopes.join(", "),
        },
        {status: 400}
      );
    }

    // Generate client credentials
    const {clientId, clientSecret} = generateClientCredentials();

    // Determine if client is confidential
    const isConfidential =
      application_type === "web" && token_endpoint_auth_method !== "none";

    // Create client in database
    const client = await createOAuthClient({
      clientId,
      clientSecret,
      name: client_name,
      redirectUris: JSON.stringify(redirect_uris),
      scopes: JSON.stringify(requestedScopes),
      grantTypes: JSON.stringify(grant_types),
      isConfidential,
    });

    // Prepare response according to RFC 7591
    const clientResponse = {
      client_id: client.clientId,
      client_secret: isConfidential ? client.clientSecret : undefined,
      client_name: client.name,
      redirect_uris: JSON.parse(client.redirectUris),
      grant_types: JSON.parse(client.grantTypes),
      response_types,
      scope: JSON.parse(client.scopes).join(" "),
      token_endpoint_auth_method,
      application_type,
      client_id_issued_at: Math.floor(
        new Date(client.createdAt).getTime() / 1000
      ),
      client_secret_expires_at: 0, // Client secret never expires
    };

    return NextResponse.json(clientResponse, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("OAuth client registration error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Internal server error",
      },
      {status: 500}
    );
  }
}

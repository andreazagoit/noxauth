import {NextRequest, NextResponse} from "next/server";

// OAuth 2.0 Authorization Server Metadata (RFC 8414)
// GET /.well-known/oauth-authorization-server
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const metadata = {
    // Required fields
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,

    // Optional but recommended fields
    userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
    jwks_uri: `${baseUrl}/oauth/jwks`,
    registration_endpoint: `${baseUrl}/oauth/register`,
    revocation_endpoint: `${baseUrl}/oauth/revoke`,
    introspection_endpoint: `${baseUrl}/oauth/introspect`,

    // Supported grant types
    grant_types_supported: [
      "authorization_code",
      "refresh_token",
      "client_credentials",
    ],

    // Supported response types
    response_types_supported: ["code"],

    // Supported scopes
    scopes_supported: [
      "read",
      "write",
      "profile",
      "email",
      "user_info",
      "openid",
    ],

    // Token endpoint authentication methods
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none", // For public clients
    ],

    // PKCE support
    code_challenge_methods_supported: ["S256", "plain"],

    // Supported response modes
    response_modes_supported: ["query", "fragment", "form_post"],

    // Subject types
    subject_types_supported: ["public"],

    // ID Token signing algorithms (for OpenID Connect)
    id_token_signing_alg_values_supported: ["HS256", "RS256"],

    // Claims supported (for OpenID Connect)
    claims_supported: [
      "sub",
      "name",
      "given_name",
      "family_name",
      "nickname",
      "email",
      "email_verified",
      "picture",
      "profile",
      "updated_at",
      "user_type",
      "role",
      "bio",
      "permissions",
    ],

    // Service documentation
    service_documentation: `${baseUrl}/docs/oauth2`,

    // UI locales supported
    ui_locales_supported: ["en", "it"],

    // Additional metadata
    op_policy_uri: `${baseUrl}/privacy-policy`,
    op_tos_uri: `${baseUrl}/terms-of-service`,

    // Capabilities
    request_parameter_supported: false,
    request_uri_parameter_supported: false,
    require_request_uri_registration: false,

    // Revocation endpoint
    revocation_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
    ],

    // Introspection endpoint
    introspection_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
    ],

    // Token formats
    token_endpoint_auth_signing_alg_values_supported: ["HS256", "RS256"],
  };

  return NextResponse.json(metadata, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}

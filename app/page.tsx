export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">NoxAuth</h1>
            <div className="flex items-center gap-4">
              <a
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </a>
              <a
                href="/auth/register/user"
                className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              OAuth 2.0 Provider
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
              Secure, standards-compliant authentication for your applications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">OAuth 2.0 Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Fully compliant with RFC 6749, 7591, 8414 and OpenID Connect
                standards
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Secure by Design</h3>
              <p className="text-sm text-muted-foreground">
                JWT tokens, PKCE support, and enterprise-grade security features
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Easy Integration</h3>
              <p className="text-sm text-muted-foreground">
                REST APIs, automatic discovery, and comprehensive documentation
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href="/auth/register/user"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started as User
            </a>
            <a
              href="/auth/register/organization"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium hover:bg-secondary/80 transition-colors"
            >
              Enterprise Sign Up
            </a>
            <a
              href="/test-oauth"
              className="border border-border px-6 py-3 rounded-md font-medium hover:bg-accent transition-colors"
            >
              Test OAuth Flow
            </a>
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">For Developers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover our OAuth 2.0 endpoints and start integrating
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="/.well-known/oauth-authorization-server"
                className="text-xs bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Discovery Endpoint
              </a>
              <a
                href="/oauth/authorize"
                className="text-xs bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Authorization
              </a>
              <a
                href="/oauth/token"
                className="text-xs bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Token Exchange
              </a>
              <a
                href="/oauth/userinfo"
                className="text-xs bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                UserInfo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {useState, useEffect} from "react";
import {useSearchParams} from "next/navigation";

export default function OAuthLogin() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientInfo, setClientInfo] = useState<{
    name: string;
    clientId: string;
  } | null>(null);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");
  const responseType = searchParams.get("response_type");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  useEffect(() => {
    if (clientId) {
      // In a real implementation, you'd fetch client info from your API
      setClientInfo({
        name: `Client ${clientId}`,
        clientId: clientId,
      });
    }
  }, [clientId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, login with credentials
      const loginResponse = await fetch("/api/auth/credentials/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });

      const loginData = await loginResponse.json();

      if (loginData.success) {
        // Now redirect to OAuth authorize endpoint
        const authorizeParams = new URLSearchParams();
        if (responseType) authorizeParams.set("response_type", responseType);
        if (clientId) authorizeParams.set("client_id", clientId);
        if (redirectUri) authorizeParams.set("redirect_uri", redirectUri);
        if (scope) authorizeParams.set("scope", scope);
        if (state) authorizeParams.set("state", state);
        if (codeChallenge) authorizeParams.set("code_challenge", codeChallenge);
        if (codeChallengeMethod)
          authorizeParams.set("code_challenge_method", codeChallengeMethod);

        window.location.href = `/oauth/authorize?${authorizeParams.toString()}`;
      } else {
        setError(loginData.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authorize Application
          </h2>
          {clientInfo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>{clientInfo.name}</strong> is requesting access to your
                account.
              </p>
              {scope && (
                <p className="text-xs text-blue-600 mt-2">
                  Requested permissions: {scope.split(" ").join(", ")}
                </p>
              )}
            </div>
          )}
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Authorizing..." : "Authorize"}
            </button>
            <a
              href="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import {useState, useEffect} from "react";

export default function TestOAuthPage() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Step 1: Register OAuth Client
  const registerClient = async () => {
    try {
      addLog("Registering OAuth client...");
      const response = await fetch("/oauth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          client_name: "Test OAuth App",
          redirect_uris: ["http://localhost:3000/test-oauth"],
          grant_types: ["authorization_code", "refresh_token"],
          scope: "read profile email",
        }),
      });

      const client = await response.json();
      setClientId(client.client_id);
      setClientSecret(client.client_secret);
      addLog(`✅ Client registered: ${client.client_id}`);
    } catch (error) {
      addLog(`❌ Client registration failed: ${error}`);
    }
  };

  // Step 2: Start Authorization Flow
  const startAuthorization = () => {
    if (!clientId) {
      addLog("❌ Please register a client first");
      return;
    }

    const authUrl = `/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      "http://localhost:3000/test-oauth"
    )}&scope=read%20profile%20email&state=test123`;
    addLog(`🔗 Opening authorization URL: ${authUrl}`);
    window.open(authUrl, "_blank");
  };

  // Step 3: Exchange Code for Token
  const exchangeCodeForToken = async () => {
    if (!authCode || !clientId || !clientSecret) {
      addLog("❌ Missing authorization code, client ID, or client secret");
      return;
    }

    try {
      addLog("Exchanging authorization code for tokens...");
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: "http://localhost:3000/test-oauth",
        client_id: clientId,
        client_secret: clientSecret,
      });

      const response = await fetch("/oauth/token", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: body,
      });

      const tokens = await response.json();
      if (tokens.access_token) {
        setAccessToken(tokens.access_token);
        addLog(
          `✅ Access token received: ${tokens.access_token.substring(0, 20)}...`
        );
      } else {
        addLog(`❌ Token exchange failed: ${JSON.stringify(tokens)}`);
      }
    } catch (error) {
      addLog(`❌ Token exchange error: ${error}`);
    }
  };

  // Step 4: Get User Info
  const getUserInfo = async () => {
    if (!accessToken) {
      addLog("❌ No access token available");
      return;
    }

    try {
      addLog("Fetching user info...");
      const response = await fetch("/oauth/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const info = await response.json();
      if (info.sub) {
        setUserInfo(info);
        addLog(`✅ User info received for: ${info.name || info.email}`);
      } else {
        addLog(`❌ UserInfo failed: ${JSON.stringify(info)}`);
      }
    } catch (error) {
      addLog(`❌ UserInfo error: ${error}`);
    }
  };

  // Check for authorization code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state === "test123") {
      setAuthCode(code);
      addLog(`✅ Authorization code received: ${code}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          OAuth 2.0 Provider Test
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                OAuth 2.0 Flow Test
              </h2>

              <div className="space-y-4">
                <button
                  onClick={registerClient}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  1. Register OAuth Client
                </button>

                <button
                  onClick={startAuthorization}
                  disabled={!clientId}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  2. Start Authorization Flow
                </button>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Authorization Code:
                  </label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Paste authorization code here"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <button
                  onClick={exchangeCodeForToken}
                  disabled={!authCode || !clientId || !clientSecret}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  3. Exchange Code for Token
                </button>

                <button
                  onClick={getUserInfo}
                  disabled={!accessToken}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:bg-gray-400"
                >
                  4. Get User Info
                </button>
              </div>
            </div>

            {/* Client Info */}
            {clientId && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">
                  Client Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Client ID:</strong> {clientId}
                  </div>
                  <div>
                    <strong>Client Secret:</strong> {clientSecret}
                  </div>
                </div>
              </div>
            )}

            {/* User Info */}
            {userInfo && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">User Information</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Test Logs</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Register OAuth Client" to create a test client</li>
            <li>
              Click "Start Authorization Flow" to open the OAuth login page
            </li>
            <li>
              Login with: <strong>test@example.com</strong> /{" "}
              <strong>password123</strong>
            </li>
            <li>You'll be redirected back with an authorization code</li>
            <li>Click "Exchange Code for Token" to get access tokens</li>
            <li>Click "Get User Info" to test the UserInfo endpoint</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

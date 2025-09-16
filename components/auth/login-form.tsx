"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/credentials/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        if (result.code === "EMAIL_NOT_VERIFIED") {
          setError(
            "Please verify your email before logging in. Check your inbox for a verification link."
          );
        } else if (result.code === "SLUG_NOT_SET") {
          setError(
            "Please set your username before logging in. You will be redirected to set it up."
          );
          // Redirect to slug setup page with token if available
          if (result.data?.token) {
            router.push(`/auth/set-slug?token=${result.data.token}`);
          }
        } else {
          setError(result.message || "Login failed");
        }
      }
    } catch {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({...loginData, email: e.target.value})
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({...loginData, password: e.target.value})
            }
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
    </div>
  );
}

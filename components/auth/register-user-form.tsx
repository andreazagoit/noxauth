"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {User} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  emailVerified?: boolean;
  type?: string;
  role?: string;
  bio?: string;
  image?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  code?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
    verificationToken?: string;
    token?: string;
  };
}

export function RegisterUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/credentials/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          type: "user",
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        }),
      });

      const result: AuthResponse = await response.json();

      if (result.success) {
        setSuccess(
          "Registrazione completata! Controlla la tua email per verificare l'account e completare la configurazione."
        );
        // Reset form
        setRegisterData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        });
      } else {
        setError(result.message || "Registration failed");
      }
    } catch {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Registrazione Utente
        </span>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({...registerData, email: e.target.value})
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={registerData.firstName}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  firstName: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={registerData.lastName}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  lastName: e.target.value,
                })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password: e.target.value,
              })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
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

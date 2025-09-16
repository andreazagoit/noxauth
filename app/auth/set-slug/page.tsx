"use client";

import {useSearchParams, useRouter} from "next/navigation";
import {useState} from "react";
import {PageHeader} from "@/components/page-header";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

export default function SetSlugPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSetSlug = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = searchParams.get("token");

    if (!token) {
      setError("Token mancante");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/credentials/set-slug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({slug, token}),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Username impostato con successo!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(
          result.message || "Errore durante l'impostazione dello username"
        );
      }
    } catch (error) {
      setError("Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="bg-card rounded-lg shadow-lg border">
          <CardHeader className="text-center">
            <PageHeader
              title="Imposta Username"
              description="Scegli un username unico per il tuo account"
            />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetSlug} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Username</Label>
                <Input
                  id="slug"
                  type="text"
                  placeholder="Il tuo username"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="Solo lettere, numeri, trattini e underscore"
                />
                <p className="text-xs text-muted-foreground">
                  Solo lettere, numeri, trattini (-) e underscore (_)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Impostazione..." : "Imposta Username"}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

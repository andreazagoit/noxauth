"use client";

import {useSearchParams} from "next/navigation";
import {useState, useEffect} from "react";
import {PageHeader} from "@/components/page-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {CheckCircle, XCircle, Loader2} from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token di verifica mancante");
        return;
      }

      try {
        const response = await fetch("/api/auth/credentials/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({token}),
        });

        const result = await response.json();

        if (result.success) {
          setStatus("success");
          setMessage("Email verificata con successo!");
        } else {
          setStatus("error");
          setMessage(result.message || "Errore durante la verifica");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Errore di rete durante la verifica");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="bg-card rounded-lg shadow-lg border">
          <CardHeader className="text-center">
            <PageHeader
              title="Verifica Email"
              description="Verifica del tuo indirizzo email"
            />
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Verifica in corso...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                <p className="text-green-600 font-medium">{message}</p>
                <Button asChild className="w-full">
                  <a href="/auth/login">Vai al login</a>
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-8 h-8 mx-auto text-red-500" />
                <p className="text-red-600 font-medium">{message}</p>
                <Button asChild variant="outline" className="w-full">
                  <a href="/auth/register/user">Torna alla registrazione</a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

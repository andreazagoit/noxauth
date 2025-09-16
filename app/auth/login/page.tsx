import {LoginForm} from "@/components/auth/login-form";
import {PageHeader} from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  Heart,
  Users,
  Shield,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Login - NoxAuth",
  description:
    "Accedi al tuo account NoxAuth e gestisci le tue applicazioni OAuth",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start lg:items-center">
          {/* Left Column - Welcome Message */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Accedi a NoxAuth
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8">
                Accedi al tuo account per gestire le tue applicazioni OAuth e
                controllare l'accesso ai tuoi servizi
              </p>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Sicurezza Avanzata</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Proteggi le tue applicazioni con OAuth 2.0 conforme agli
                    standard RFC
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Gestione Centralizzata</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Controlla tutti i tuoi client OAuth da un'unica dashboard
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Token Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Gestisci access token, refresh token e scadenze in modo
                    automatico
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="w-full order-1 lg:order-2">
            <div className="bg-card rounded-lg shadow-lg border p-6 lg:p-8 sticky top-8">
              <PageHeader
                title="Accedi al tuo account"
                description="Inserisci le tue credenziali per continuare"
              />

              <div className="mt-8">
                <LoginForm />

                <div className="mt-6 text-center space-y-4">
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Non hai ancora un account?
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/auth/register/user"
                        className="flex w-full text-center text-sm text-primary hover:underline font-medium items-center justify-center gap-1"
                      >
                        <Users className="w-4 h-4" />
                        Registrati come utente
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        href="/auth/register/organization"
                        className="flex w-full text-center text-sm text-primary hover:underline font-medium items-center justify-center gap-1"
                      >
                        <Building2 className="w-4 h-4" />
                        Registrati come organizzazione
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {RegisterUserForm} from "@/components/auth/register-user-form";
import {PageHeader} from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Calendar,
  Bell,
  Heart,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Shield,
  Key,
  Database,
} from "lucide-react";

export const metadata = {
  title: "Registrazione Utente - NoxAuth",
  description:
    "Unisciti a NoxAuth e gestisci le tue applicazioni OAuth in modo sicuro",
};

export default function RegisterUserPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Benefits */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Gestisci la sicurezza delle tue app
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8">
                Unisciti a NoxAuth e proteggi le tue applicazioni con OAuth 2.0
                conforme agli standard internazionali
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>OAuth 2.0 Compliant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Provider OAuth 2.0 completamente conforme agli standard RFC
                    6749, 7591, 8414 e OpenID Connect
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Gestione Token Sicura</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    JWT tokens sicuri con refresh automatico, scadenze
                    personalizzabili e revoca immediata
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Client Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Registrazione dinamica dei client, gestione scope e
                    monitoraggio degli accessi in tempo reale
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Multi-tenant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Supporto per utenti e organizzazioni con ruoli
                    personalizzabili e permessi granulari
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Perché scegliere NoxAuth?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Standard OAuth 2.0 e OpenID Connect
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  PKCE support per client pubblici
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Discovery automatico dei metadati
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Dashboard intuitiva e API REST complete
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="w-full order-1 lg:order-2">
            <div className="bg-card rounded-lg shadow-lg border p-6 lg:p-8 sticky top-8">
              <PageHeader
                title="Crea il tuo account"
                description="Inizia a proteggere le tue applicazioni"
              />

              <div className="mt-8">
                <RegisterUserForm />

                <div className="mt-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Hai già un account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Accedi
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </p>
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">
                      Rappresenti un&apos;organizzazione?{" "}
                      <Link
                        href="/auth/register/organization"
                        className="text-primary hover:underline font-medium"
                      >
                        Registrati come organizzazione
                      </Link>
                    </p>
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

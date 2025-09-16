import {RegisterOrganizationForm} from "@/components/auth/register-organization-form";
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
  Building2,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Globe,
  BarChart3,
  Settings,
} from "lucide-react";

export const metadata = {
  title: "Registrazione Organizzazione - NoxAuth",
  description:
    "Registra la tua organizzazione su NoxAuth e gestisci l'autenticazione su scala enterprise",
};

export default function RegisterOrganizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Enterprise Benefits */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                OAuth Enterprise Ready
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8">
                Proteggi la tua organizzazione con un provider OAuth 2.0
                enterprise-grade, scalabile e conforme agli standard
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Multi-Application Support</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Gestisci l'autenticazione per tutte le applicazioni della
                    tua organizzazione da un'unica piattaforma
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Team Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Ruoli e permessi granulari per i membri del team con
                    controllo degli accessi centralizzato
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Analytics & Monitoring</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Dashboard avanzate con metriche di utilizzo, log degli
                    accessi e monitoraggio della sicurezza
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>API First</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    API REST complete per integrazioni custom e automazione dei
                    processi di autenticazione
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Sicurezza Enterprise
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Conformità GDPR e standard internazionali
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Audit log completi e tracciabilità
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Rate limiting e protezione DDoS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Backup automatici e disaster recovery
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="w-full order-1 lg:order-2">
            <div className="bg-card rounded-lg shadow-lg border p-6 lg:p-8 sticky top-8">
              <PageHeader
                title="Registra la tua organizzazione"
                description="Inizia a proteggere le tue applicazioni enterprise"
              />

              <div className="mt-8">
                <RegisterOrganizationForm />

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
                      Sei un utente individuale?{" "}
                      <Link
                        href="/auth/register/user"
                        className="text-primary hover:underline font-medium"
                      >
                        Registrati come utente
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

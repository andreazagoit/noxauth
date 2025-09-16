import Link from "next/link";
import {ArrowLeft} from "lucide-react";

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna alla home
            </Link>
            <Link href="/" className="text-xl font-bold">
              NoxAuth
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

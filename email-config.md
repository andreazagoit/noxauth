# Configurazione Email

Per abilitare l'invio di email di verifica, aggiungi queste variabili al tuo file `.env.local`:

```bash
# Email Configuration (per sviluppo - Ethereal Email)
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="ethereal.user@ethereal.email"
SMTP_PASS="ethereal.pass"
SMTP_FROM="noreply@noxauth.com"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## Per sviluppo (Ethereal Email)

1. Vai su https://ethereal.email/
2. Crea un account gratuito
3. Genera le credenziali SMTP
4. Sostituisci i valori sopra con le tue credenziali

## Per produzione

Sostituisci con un provider reale come:
- Gmail SMTP
- SendGrid
- Mailgun
- AWS SES

Esempio per Gmail:
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

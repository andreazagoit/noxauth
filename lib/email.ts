import nodemailer from "nodemailer";

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(EMAIL_CONFIG);
};

// Template HTML per email di verifica
const createVerificationEmailTemplate = (
  name: string,
  verificationUrl: string
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica il tuo account - NoxAuth</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background: #5a6fd8;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 NoxAuth</h1>
        <p>Verifica il tuo account</p>
      </div>
      <div class="content">
        <h2>Ciao ${name}!</h2>
        <p>Grazie per esserti registrato su NoxAuth. Per completare la registrazione, clicca sul pulsante qui sotto per verificare il tuo indirizzo email.</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verifica Email</a>
        </div>
        
        <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${verificationUrl}
        </p>
        
        <p><strong>Nota:</strong> Questo link scadrà tra 24 ore per motivi di sicurezza.</p>
      </div>
      <div class="footer">
        <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
        <p>© 2024 NoxAuth. Tutti i diritti riservati.</p>
      </div>
    </body>
    </html>
  `;
};

// Email sending functions
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.SMTP_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return {success: true, messageId: result.messageId};
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Funzione per inviare email di verifica
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  const verificationUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/auth/verify-email?token=${verificationToken}`;
  const template = createVerificationEmailTemplate(name, verificationUrl);

  return await sendEmail(
    email,
    "Verifica il tuo account - NoxAuth",
    template,
    `Ciao ${name}!\n\nGrazie per esserti registrato su NoxAuth. Per completare la registrazione, visita questo link:\n\n${verificationUrl}\n\nQuesto link scadrà tra 24 ore.\n\nSe non hai richiesto questa registrazione, puoi ignorare questa email.\n\n© 2024 NoxAuth`
  );
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return {success: true};
  } catch (error) {
    console.error("Email configuration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

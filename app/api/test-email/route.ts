import {NextRequest, NextResponse} from "next/server";
import {testEmailConfiguration, sendVerificationEmail} from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Testa la configurazione email
    const result = await testEmailConfiguration();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Email configuration test failed",
          details: result.error || "Check your SMTP settings in .env.local",
        },
        {status: 500}
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration is working correctly",
      details: "SMTP connection verified successfully",
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Email test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {status: 500}
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {email, name} = body;

    if (!email || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and name are required",
        },
        {status: 400}
      );
    }

    // Invia email di test
    const emailResult = await sendVerificationEmail(
      email,
      name,
      "test-token-123"
    );

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send test email",
          error: emailResult.error,
        },
        {status: 500}
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details:
        "Check your inbox (or Ethereal Email preview if using development settings)",
    });
  } catch (error) {
    console.error("Test email send error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {status: 500}
    );
  }
}

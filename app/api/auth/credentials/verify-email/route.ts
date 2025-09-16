import {NextRequest, NextResponse} from "next/server";
import {emailVerificationSchema} from "@/lib/validation";
import {verifyEmailVerificationToken} from "@/lib/auth";
import {verifyUserEmail} from "@/lib/db-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = emailVerificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          data: {
            details: validationResult.error.issues,
          },
        },
        {status: 400}
      );
    }

    const {token} = validationResult.data;

    // Verify token
    const tokenData = verifyEmailVerificationToken(token);
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification token",
          code: "INVALID_TOKEN",
        },
        {status: 400}
      );
    }

    // Verify user email
    const user = await verifyUserEmail(tokenData.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          type: user.type,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      {status: 500}
    );
  }
}

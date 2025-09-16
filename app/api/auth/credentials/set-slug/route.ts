import {NextRequest, NextResponse} from "next/server";
import {slugSchema} from "@/lib/validation";
import {verifyEmailVerificationToken} from "@/lib/auth";
import {setUserSlug, getUserBySlug} from "@/lib/db-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = slugSchema.safeParse(body);
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

    const {slug, token} = validationResult.data;

    // Verify token
    const tokenData = verifyEmailVerificationToken(token);
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          code: "INVALID_TOKEN",
        },
        {status: 400}
      );
    }

    // Check if slug is already taken
    const existingUser = await getUserBySlug(slug);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
          code: "SLUG_TAKEN",
        },
        {status: 409}
      );
    }

    // Set user slug
    const user = await setUserSlug(tokenData.userId, slug);
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
      message: "Username set successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          slug: user.slug,
          emailVerified: user.emailVerified,
          type: user.type,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Set slug error:", error);
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

import {NextRequest, NextResponse} from "next/server";
import {loginSchema} from "@/lib/validation";
import {
  verifyPassword,
  generateTokens,
  generateEmailVerificationToken,
} from "@/lib/auth";
import {getUserWithCredentials} from "@/lib/db-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
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

    const {email, password} = validationResult.data;

    // Get user with credentials
    const userWithCredentials = await getUserWithCredentials(email);
    if (!userWithCredentials) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        {status: 401}
      );
    }

    const {user, credential} = userWithCredentials;

    // Check if credentials exist
    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        {status: 401}
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      password,
      credential.passwordHash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
        {status: 401}
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate a new email verification token
      const verificationToken = generateEmailVerificationToken(user.id);

      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in",
          code: "EMAIL_NOT_VERIFIED",
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              emailVerified: user.emailVerified,
              slug: user.slug,
              type: user.type,
              role: user.role,
              bio: user.bio,
              image: user.image,
            },
            verificationToken,
          },
        },
        {status: 403}
      );
    }

    // Check if slug is set
    if (!user.slug) {
      // Generate a token for setting slug
      const slugToken = generateEmailVerificationToken(user.id);

      return NextResponse.json(
        {
          success: false,
          message: "Please set your username before logging in",
          code: "SLUG_NOT_SET",
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              emailVerified: user.emailVerified,
              slug: user.slug,
              type: user.type,
              role: user.role,
              bio: user.bio,
              image: user.image,
            },
            token: slugToken,
          },
        },
        {status: 403}
      );
    }

    // Generate access and refresh tokens
    const {accessToken, refreshToken} = generateTokens({
      userId: user.id,
      email: user.email,
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
        bio: user.bio,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
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
          bio: user.bio,
          image: user.image,
        },
      },
    });

    // Set cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
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

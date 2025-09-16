import {NextRequest, NextResponse} from "next/server";
import {registerSchema} from "@/lib/validation";
import {hashPassword, generateEmailVerificationToken} from "@/lib/auth";
import {createUser, createCredential, getUserByEmail} from "@/lib/db-queries";
import {sendVerificationEmail} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const {email, password, type, firstName, lastName, name} =
      validationResult.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
          code: "USER_EXISTS",
        },
        {status: 409}
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Prepare user data
    let userData;
    if (type === "user") {
      userData = {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        type: "user",
        role: "user" as const,
      };
    } else {
      userData = {
        email,
        name: name!,
        type: "organization",
        role: "user" as const,
      };
    }

    // Create user
    const user = await createUser(userData);

    // Create credentials
    await createCredential({
      userId: user.id,
      passwordHash,
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(user.id);

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      user.name || user.firstName || "User",
      verificationToken
    );

    const emailSent = emailResult.success;
    if (!emailSent) {
      console.warn(
        "Failed to send verification email, but user was created:",
        emailResult.error
      );
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "User created successfully. Please check your email to verify your account."
        : "User created successfully. Please verify your email using the token provided.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        verificationToken: emailSent ? undefined : verificationToken, // Non mostrare il token se l'email è stata inviata
        emailSent,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
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

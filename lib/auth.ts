import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(payload: {
  user: Record<string, unknown>;
}): string {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"});
}

export function generateRefreshToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: "90d"});
}

export function generateTokens(payload: {
  userId: string;
  email: string;
  user: Record<string, unknown>;
}): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken({user: payload.user}),
    refreshToken: generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
    }),
  };
}

export function verifyAccessToken(
  token: string
): {user: Record<string, unknown>} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {user: Record<string, unknown>};
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string
): {userId: string; email: string} | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
}

export function generateEmailVerificationToken(userId: string): string {
  return jwt.sign({type: "email_verification", userId}, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyEmailVerificationToken(
  token: string
): {userId: string} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      type: string;
      userId: string;
    };
    if (decoded.type === "email_verification" && decoded.userId) {
      return {userId: decoded.userId};
    }
    return null;
  } catch {
    return null;
  }
}

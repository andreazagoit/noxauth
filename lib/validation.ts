import {z} from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    type: z.enum(["user", "organization"]),
    // For user type: firstName and lastName are required, name is auto-generated
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    // For organization type: name is required, firstName and lastName are ignored
    name: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "user") {
        return data.firstName && data.lastName && !data.name;
      } else if (data.type === "organization") {
        return data.name && !data.firstName && !data.lastName;
      }
      return false;
    },
    {
      message:
        "For user type: firstName and lastName are required. For organization type: name is required.",
      path: ["type"],
    }
  );

export const slugSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug can only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  token: z.string().min(1, "Verification token is required"),
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSlug(slug: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (slug.length < 3) {
    errors.push("Slug must be at least 3 characters");
  }

  if (slug.length > 50) {
    errors.push("Slug must be less than 50 characters");
  }

  if (!/^[a-z0-9-_]+$/.test(slug)) {
    errors.push(
      "Slug can only contain lowercase letters, numbers, hyphens, and underscores"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

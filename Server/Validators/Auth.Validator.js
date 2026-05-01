import { z } from "zod";

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character",
  );

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(3, "First name must be at least 3 characters")
      .max(50, "First name must be at most 50 characters"),

    lastName: z
      .string()
      .min(3, "Last name must be at least 3 characters")
      .max(50, "Last name must be at most 50 characters"),

    email: z.string().email("Please enter a valid email address"),

    password: PasswordSchema,

    confirmPassword: z.string(),

    role: z.enum(["student", "instructor"]).default("student"),
    bio: z.string().max(500).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

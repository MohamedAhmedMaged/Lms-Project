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

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

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
    role: z.enum(["student", "instructor"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be at least 0"),
  discountPrice: z
    .number()
    .min(0, "Discount price must be at least 0")
    .optional()
    .nullable(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  duration: z.number().min(0, "Duration must be at least 0").optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
});

export const CreateLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  content: z.string().optional(),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  duration: z.number().min(0, "Duration must be at least 0").optional(),
  isPreview: z.boolean().optional(),
});

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { success: true };

  const fieldErrors = {};
  for (const issue of result.error.errors) {
    const field = issue.path.join(".");
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

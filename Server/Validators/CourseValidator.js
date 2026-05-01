import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),

  thumbnail: z.string().url("Invalid thumbnail URL").optional().nullable(),

  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),

  price: z.number().min(0, "Price must be at least 0"),

  discountPrice: z
    .number()
    .min(0, "Discount price must be at least 0")
    .optional()
    .nullable(),

  level: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional()
    .default("beginner"),

  duration: z
    .number()
    .min(0, "Duration must be at least 0")
    .optional()
    .default(0),

  tags: z.array(z.string()).optional().default([]),

  requirements: z.array(z.string()).optional().default([]),

  whatYouWillLearn: z.array(z.string()).optional().default([]),
});

export const UpdateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters")
    .optional(),

  thumbnail: z.string().url("Invalid thumbnail URL").optional().nullable(),

  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    .optional(),

  price: z.number().min(0, "Price must be at least 0").optional(),

  discountPrice: z
    .number()
    .min(0, "Discount price must be at least 0")
    .optional()
    .nullable(),

  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),

  duration: z.number().min(0, "Duration must be at least 0").optional(),

  isPublished: z.boolean().optional(),

  tags: z.array(z.string()).optional(),

  requirements: z.array(z.string()).optional(),

  whatYouWillLearn: z.array(z.string()).optional(),
});

export const SearchCoursesSchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),

  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    .optional(),

  minPrice: z.coerce.number().min(0).optional(),

  maxPrice: z.coerce.number().min(0).optional(),

  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),

  page: z.coerce.number().min(1).optional().default(1),

  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

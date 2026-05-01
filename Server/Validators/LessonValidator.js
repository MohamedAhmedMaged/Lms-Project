import { z } from "zod";

export const CreateLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),

  content: z.string().optional(),

  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),

  duration: z.number().min(0, "Duration must be at least 0").optional(),

  order: z.number().min(0, "Order must be at least 0").optional(),

  isPreview: z.boolean().optional().default(false),

  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        type: z.enum(["pdf", "video", "link", "code"]),
      }),
    )
    .optional(),
});

export const UpdateLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),

  content: z.string().optional(),

  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),

  duration: z.number().min(0, "Duration must be at least 0").optional(),

  order: z.number().min(0, "Order must be at least 0").optional(),

  isPreview: z.boolean().optional(),

  isPublished: z.boolean().optional(),

  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        type: z.enum(["pdf", "video", "link", "code"]),
      }),
    )
    .optional(),
});

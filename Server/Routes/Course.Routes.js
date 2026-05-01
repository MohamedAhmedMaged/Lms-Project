import { Router } from "express";
import { courseController } from "../Controllers/CourseController.js";
import {
  authenticate,
  optionalAuthenticate,
  authorize,
} from "../Middlewares/Auth.Middleware.js";
import {
  validateBody,
  validateQuery,
} from "../Middlewares/Validate.Middleware.js";
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  SearchCoursesSchema,
} from "../Validators/CourseValidator.js";

const router = Router();

router.get("/", courseController.GetAllCourses);
router.get(
  "/search",
  validateQuery(SearchCoursesSchema),
  courseController.SearchCourses,
);
router.get(
  "/slug/:slug",
  optionalAuthenticate,
  courseController.GetCourseBySlug,
);

router.get(
  "/instructor/my-courses",
  authenticate,
  authorize("instructor", "admin"),
  courseController.GetInstructorCourses,
);

router.get(
  "/student/my-courses",
  authenticate,
  courseController.GetStudentCourses,
);

router.get("/:id", courseController.GetCourse);

router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  validateBody(CreateCourseSchema),
  courseController.CreateCourse,
);
router.patch(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  validateBody(UpdateCourseSchema),
  courseController.UpdateCourse,
);
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  courseController.DeleteCourse,
);
router.patch(
  "/:id/publish",
  authenticate,
  authorize("instructor", "admin"),
  courseController.PublishCourse,
);
router.patch(
  "/:id/unpublish",
  authenticate,
  authorize("instructor", "admin"),
  courseController.UnpublishCourse,
);

router.get(
  "/:courseId/lessons",
  optionalAuthenticate,
  courseController.GetCourseLessons,
);
router.post(
  "/:courseId/lessons",
  authenticate,
  authorize("instructor", "admin"),
  courseController.CreateLesson,
);
router.patch(
  "/:courseId/lessons/reorder",
  authenticate,
  authorize("instructor", "admin"),
  courseController.ReorderLessons,
);

router.get("/:courseId/lessons/:lessonId", courseController.GetLesson);
router.patch(
  "/:courseId/lessons/:lessonId",
  authenticate,
  authorize("instructor", "admin"),
  courseController.UpdateLesson,
);
router.delete(
  "/:courseId/lessons/:lessonId",
  authenticate,
  authorize("instructor", "admin"),
  courseController.DeleteLesson,
);

router.get("/:courseId/reviews", courseController.GetCourseReviews);
router.post(
  "/:courseId/reviews",
  authenticate,
  authorize("student"),
  courseController.CreateReview,
);
router.put(
  "/:courseId/reviews/:reviewId",
  authenticate,
  authorize("student"),
  courseController.UpdateReview,
);
router.delete(
  "/:courseId/reviews/:reviewId",
  authenticate,
  authorize("student"),
  courseController.DeleteReview,
);

router.post(
  "/:courseId/lessons/:lessonId/complete",
  authenticate,
  authorize("student"),
  courseController.MarkLessonComplete,
);
router.get(
  "/:courseId/progress",
  authenticate,
  courseController.GetCourseProgress,
);

export { router as CourseRouter };

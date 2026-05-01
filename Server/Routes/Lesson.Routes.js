import { Router } from "express";
import { lessonService } from "../Services/LessonService.js";
import { authenticate, authorize } from "../Middlewares/Auth.Middleware.js";
import { catchAsync } from "../Utils/catchAsync.js";

const router = Router();

router.get(
  "/course/:courseId",
  catchAsync(async (req, res) => {
    const lessons = await lessonService.GetCourseLessons(
      req.params.courseId,
      req.user?.id,
    );

    res.status(200).json({
      status: "success",
      results: lessons.length,
      data: lessons,
    });
  }),
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const lesson = await lessonService.GetLessonById(
      req.params.id,
      req.user?.id,
    );

    res.status(200).json({
      status: "success",
      data: lesson,
    });
  }),
);

router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  catchAsync(async (req, res) => {
    const lesson = await lessonService.CreateLesson(req.body, req.user.id);

    res.status(201).json({
      status: "success",
      data: lesson,
    });
  }),
);

router.patch(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  catchAsync(async (req, res) => {
    const lesson = await lessonService.UpdateLesson(
      req.params.id,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: lesson,
    });
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  catchAsync(async (req, res) => {
    const result = await lessonService.DeleteLesson(req.params.id, req.user.id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  }),
);

router.patch(
  "/:id/publish",
  authenticate,
  authorize("instructor", "admin"),
  catchAsync(async (req, res) => {
    const lesson = await lessonService.PublishLesson(
      req.params.id,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: lesson,
    });
  }),
);

router.patch(
  "/:id/unpublish",
  authenticate,
  authorize("instructor", "admin"),
  catchAsync(async (req, res) => {
    const lesson = await lessonService.UnpublishLesson(
      req.params.id,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: lesson,
    });
  }),
);

export { router as LessonRouter };

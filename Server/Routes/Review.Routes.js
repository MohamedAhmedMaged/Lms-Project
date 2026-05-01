import { Router } from "express";
import { reviewService } from "../Services/ReviewService.js";
import { authenticate, authorize } from "../Middlewares/Auth.Middleware.js";
import { catchAsync } from "../Utils/catchAsync.js";

const router = Router();

router.get(
  "/my-reviews",
  authenticate,
  catchAsync(async (req, res) => {
    const reviews = await reviewService.GetUserReviews(req.user.id);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  }),
);

router.get(
  "/courses/:courseId/reviews",
  catchAsync(async (req, res) => {
    const reviews = await reviewService.GetCourseReviews(req.params.courseId);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  }),
);

router.post(
  "/courses/:courseId/reviews",
  authenticate,
  authorize("student"),
  catchAsync(async (req, res) => {
    const reviewData = {
      studentId: req.user.id,
      courseId: req.params.courseId,
      ...req.body,
    };

    const review = await reviewService.CreateReview(reviewData);

    res.status(201).json({
      status: "success",
      data: review,
    });
  }),
);

router.put(
  "/courses/:courseId/reviews/:reviewId",
  authenticate,
  authorize("student"),
  catchAsync(async (req, res) => {
    const review = await reviewService.UpdateReview(
      req.params.reviewId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: review,
    });
  }),
);

router.delete(
  "/courses/:courseId/reviews/:reviewId",
  authenticate,
  authorize("student"),
  catchAsync(async (req, res) => {
    const result = await reviewService.DeleteReview(
      req.params.reviewId,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  }),
);

export { router as ReviewRouter };

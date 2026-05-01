import { courseService } from "../Services/CourseService.js";
import { lessonService } from "../Services/LessonService.js";
import { reviewService } from "../Services/ReviewService.js";
import { enrollmentService } from "../Services/EnrollmentService.js";
import { catchAsync } from "../Utils/catchAsync.js";

class CourseController {
  CreateCourse = catchAsync(async (req, res) => {
    const course = await courseService.CreateCourse(req.body, req.user.id);

    res.status(201).json({
      status: "success",
      data: course,
    });
  });

  GetAllCourses = catchAsync(async (req, res) => {
    const courses = await courseService.GetAllCourses(req.query);

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: courses,
    });
  });

  GetCourse = catchAsync(async (req, res) => {
    const course = await courseService.GetCourseById(req.params.id);

    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  GetCourseBySlug = catchAsync(async (req, res) => {
    const course = await courseService.GetCourseBySlug(req.params.slug);

    let isEnrolled = false;
    if (req.user && req.user.role === "student") {
      isEnrolled = await enrollmentService.IsEnrolled(req.user.id, course._id);
    }

    const courseData = course.toObject();
    courseData.id = courseData._id.toString();
    delete courseData._id;
    courseData.isEnrolled = isEnrolled;

    res.status(200).json({
      status: "success",
      data: courseData,
    });
  });

  UpdateCourse = catchAsync(async (req, res) => {
    const course = await courseService.UpdateCourse(
      req.params.id,
      req.user.id,
      req.body,
      req.user.role === "admin",
    );

    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  DeleteCourse = catchAsync(async (req, res) => {
    const result = await courseService.DeleteCourse(
      req.params.id,
      req.user.id,
      req.user.role === "admin",
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  PublishCourse = catchAsync(async (req, res) => {
    const course = await courseService.PublishCourse(
      req.params.id,
      req.user.id,
      req.user.role === "admin",
    );

    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  UnpublishCourse = catchAsync(async (req, res) => {
    const course = await courseService.UnpublishCourse(
      req.params.id,
      req.user.id,
      req.user.role === "admin",
    );

    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  GetInstructorCourses = catchAsync(async (req, res) => {
    const courses = await courseService.GetInstructorCourses(req.user.id);

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: courses,
    });
  });

  GetStudentCourses = catchAsync(async (req, res) => {
    const courses = await courseService.GetStudentEnrolledCourses(req.user.id);

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: courses,
    });
  });

  SearchCourses = catchAsync(async (req, res) => {
    const { q } = req.query;
    const courses = await courseService.SearchCourses(q);

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: courses,
    });
  });

  GetCourseLessons = catchAsync(async (req, res) => {
    const lessons = await lessonService.GetCourseLessons(
      req.params.courseId,
      req.user?.id,
    );

    res.status(200).json({
      status: "success",
      results: lessons.length,
      data: lessons,
    });
  });

  CreateLesson = catchAsync(async (req, res) => {
    const lessonData = {
      ...req.body,
      courseId: req.params.courseId,
    };

    const lesson = await lessonService.CreateLesson(lessonData, req.user.id);

    res.status(201).json({
      status: "success",
      data: lesson,
    });
  });

  GetLesson = catchAsync(async (req, res) => {
    const lesson = await lessonService.GetLessonById(
      req.params.lessonId,
      req.user?.id,
    );

    res.status(200).json({
      status: "success",
      data: lesson,
    });
  });

  UpdateLesson = catchAsync(async (req, res) => {
    const lesson = await lessonService.UpdateLesson(
      req.params.lessonId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: lesson,
    });
  });

  DeleteLesson = catchAsync(async (req, res) => {
    const result = await lessonService.DeleteLesson(
      req.params.lessonId,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  ReorderLessons = catchAsync(async (req, res) => {
    const result = await lessonService.ReorderLessons(
      req.params.courseId,
      req.user.id,
      req.body.lessonOrders,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  GetCourseReviews = catchAsync(async (req, res) => {
    const reviews = await reviewService.GetCourseReviews(req.params.courseId);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  });

  CreateReview = catchAsync(async (req, res) => {
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
  });

  UpdateReview = catchAsync(async (req, res) => {
    const review = await reviewService.UpdateReview(
      req.params.reviewId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: review,
    });
  });

  DeleteReview = catchAsync(async (req, res) => {
    const result = await reviewService.DeleteReview(
      req.params.reviewId,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  MarkLessonComplete = catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.UpdateProgress(
      req.user.id,
      req.params.courseId,
      req.params.lessonId,
    );

    res.status(200).json({
      status: "success",
      data: enrollment,
    });
  });

  GetCourseProgress = catchAsync(async (req, res) => {
    const progress = await enrollmentService.GetCourseProgress(
      req.user.id,
      req.params.courseId,
    );

    res.status(200).json({
      status: "success",
      data: progress,
    });
  });
}

export const courseController = new CourseController();

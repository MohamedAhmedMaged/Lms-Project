import { EnrollmentModel } from "../Models/Enrollment.js";
import { AppError, GenericErrors } from "../Errors/CustomErrors.js";

export const requireEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId || req.body.courseId;

    if (!courseId) {
      return next(new AppError("Course ID is required", 400));
    }

    const enrollment = await EnrollmentModel.findOne({
      student: userId,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      return next(
        GenericErrors.noPermission(
          "You must be enrolled in this course to access this content",
        ),
      );
    }

    req.enrollment = enrollment;

    next();
  } catch (error) {
    next(error);
  }
};

export const checkEnrollment = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const courseId = req.params.courseId;

    if (userId && courseId) {
      const enrollment = await EnrollmentModel.findOne({
        student: userId,
        course: courseId,
        status: { $in: ["active", "completed"] },
      });

      req.isEnrolled = !!enrollment;
      req.enrollment = enrollment;
    } else {
      req.isEnrolled = false;
    }

    next();
  } catch (error) {
    next(error);
  }
};

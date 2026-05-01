import { EnrollmentModel } from "../Models/Enrollment.js";
import { CourseModel } from "../Models/Course.js";
import { LessonModel } from "../Models/Lesson.js";
import { AppError, GenericErrors } from "../Errors/CustomErrors.js";

class EnrollmentService {
  async CreateEnrollment(studentId, courseId) {
    const course = await CourseModel.findOne({
      _id: courseId,
      isPublished: true,
    });

    if (!course) {
      throw GenericErrors.elementNotFound(
        "Course",
        "",
        "not found or not published",
      );
    }

    let enrollment;
    try {
      enrollment = await EnrollmentModel.create({
        student: studentId,
        course: courseId,
        enrolledAt: new Date(),
        status: "active",
        progress: 0,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("You are already enrolled in this course", 409);
      }
      throw error;
    }

    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { totalStudents: 1 },
    });

    return enrollment;
  }

  async GetEnrollmentById(enrollmentId, studentId) {
    const enrollment = await EnrollmentModel.findOne({
      _id: enrollmentId,
      student: studentId,
    }).populate("course", "title slug thumbnail");

    if (!enrollment) {
      throw GenericErrors.elementNotFound("Enrollment");
    }

    return enrollment;
  }

  async GetStudentEnrollments(studentId) {
    const enrollments = await EnrollmentModel.find({ student: studentId })
      .populate("course", "title slug thumbnail instructors averageRating")
      .sort({ enrolledAt: -1 });

    return enrollments;
  }

  async UpdateProgress(studentId, courseId, lessonId, progress) {
    const enrollment = await EnrollmentModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      throw GenericErrors.elementNotFound("Enrollment");
    }

    const lesson = await LessonModel.findOne({
      _id: lessonId,
      course: courseId,
    });

    if (!lesson) {
      throw GenericErrors.elementNotFound(
        "Lesson",
        "",
        "not found in this course",
      );
    }

    const existingCompletion = enrollment.completedLessons.find(
      (cl) => cl.lesson.toString() === lessonId,
    );

    if (!existingCompletion) {
      enrollment.completedLessons.push({
        lesson: lessonId,
        completedAt: new Date(),
      });
    }

    const totalLessons = await LessonModel.countDocuments({
      course: courseId,
      isPublished: true,
    });

    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = Math.round((completedCount / totalLessons) * 100);

    if (enrollment.progress >= 100) {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return enrollment;
  }

  async IsEnrolled(studentId, courseId) {
    const enrollment = await EnrollmentModel.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });

    return !!enrollment;
  }

  async GetCourseProgress(studentId, courseId) {
    const enrollment = await EnrollmentModel.findOne({
      student: studentId,
      course: courseId,
    }).populate("completedLessons.lesson", "title order");

    if (!enrollment) {
      throw GenericErrors.elementNotFound("Enrollment");
    }

    return {
      progress: enrollment.progress,
      status: enrollment.status,
      completedLessons: enrollment.completedLessons,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    };
  }

  async DropEnrollment(studentId, enrollmentId) {
    const enrollment = await EnrollmentModel.findOne({
      _id: enrollmentId,
      student: studentId,
    });

    if (!enrollment) {
      throw GenericErrors.elementNotFound("Enrollment");
    }

    enrollment.status = "dropped";
    await enrollment.save();

    await CourseModel.findByIdAndUpdate(enrollment.course, {
      $inc: { totalStudents: -1 },
    });

    return enrollment;
  }

  async GetCourseStudents(courseId, instructorId) {
    const course = await CourseModel.findOne({
      _id: courseId,
      instructors: { $in: [instructorId] },
    });

    if (!course) {
      throw GenericErrors.elementNotFound(
        "Course",
        "",
        "not found or you do not have permission",
      );
    }

    const enrollments = await EnrollmentModel.find({
      course: courseId,
      status: { $in: ["active", "completed"] },
    })
      .populate("student", "firstName lastName email avatar")
      .sort({ enrolledAt: -1 });

    return enrollments;
  }
}

export const enrollmentService = new EnrollmentService();

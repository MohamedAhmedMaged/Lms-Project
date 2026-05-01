import { LessonModel } from "../Models/Lesson.js";
import { CourseModel } from "../Models/Course.js";
import { EnrollmentModel } from "../Models/Enrollment.js";
import { GenericErrors } from "../Errors/CustomErrors.js";

class LessonService {
  async CreateLesson(lessonData, instructorId) {
    const { title, courseId, content, videoUrl, order, isPreview } = lessonData;

    const course = await CourseModel.findOne({
      _id: courseId,
      instructors: { $in: [instructorId] },
    });

    if (!course) {
      throw GenericErrors.noPermission(
        "Course not found or you do not have permission to add lessons",
      );
    }

    const lesson = await LessonModel.create({
      title,
      course: courseId,
      instructor: instructorId,
      content,
      videoUrl,
      order,
      isPreview: isPreview || false,
    });

    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { lessonsCount: 1 },
    });

    return lesson;
  }

  async GetCourseLessons(courseId, userId = null) {
    let isInstructor = false;
    if (userId) {
      const course = await CourseModel.findOne({
        _id: courseId,
        instructors: { $in: [userId] },
      });
      if (course) isInstructor = true;
    }

    if (isInstructor) {
      const lessons = await LessonModel.find({ course: courseId })
        .sort({ order: 1 })
        .select("-__v");
      return lessons;
    }

    const enrollment = userId
      ? await EnrollmentModel.findOne({
          student: userId,
          course: courseId,
          status: { $in: ["active", "completed"] },
        })
      : null;

    if (enrollment) {
      const lessons = await LessonModel.find({
        course: courseId,
        isPublished: true,
      })
        .sort({ order: 1 })
        .select("-__v");
      return lessons;
    }

    const lessons = await LessonModel.find({
      course: courseId,
      isPublished: true,
    })
      .sort({ order: 1 })
      .select("-__v");

    return lessons.map((lesson) => {
      if (lesson.isPreview) return lesson;
      return {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        order: lesson.order,
        duration: lesson.duration,
        isPreview: lesson.isPreview,
        isPublished: lesson.isPublished,
        course: lesson.course,
      };
    });
  }

  async GetLessonById(lessonId, userId = null) {
    const lesson = await LessonModel.findById(lessonId);

    if (!lesson) {
      throw GenericErrors.elementNotFound("Lesson");
    }

    if (lesson.isPreview) return lesson;

    if (!userId) {
      throw GenericErrors.notLoggedIn("Please log in to view this lesson");
    }

    const enrollment = await EnrollmentModel.findOne({
      student: userId,
      course: lesson.course,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      throw GenericErrors.noPermission(
        "You must be enrolled in this course to view this lesson",
      );
    }

    return lesson;
  }

  async UpdateLesson(lessonId, instructorId, updateData) {
    const lesson = await LessonModel.findOne({
      _id: lessonId,
      instructor: instructorId,
    });

    if (!lesson) {
      throw GenericErrors.noPermission(
        "Lesson not found or you do not have permission to edit it",
      );
    }

    lesson.set(updateData);
    await lesson.save();

    return lesson;
  }

  async DeleteLesson(lessonId, instructorId) {
    const lesson = await LessonModel.findOne({
      _id: lessonId,
      instructor: instructorId,
    });

    if (!lesson) {
      throw GenericErrors.noPermission(
        "Lesson not found or you do not have permission to delete it",
      );
    }

    const courseId = lesson.course;

    await lesson.softDelete();

    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { lessonsCount: -1 },
    });

    return { message: "Lesson deleted successfully" };
  }

  async ReorderLessons(courseId, instructorId, lessonOrders) {
    const course = await CourseModel.findOne({
      _id: courseId,
      instructors: { $in: [instructorId] },
    });

    if (!course) {
      throw GenericErrors.noPermission(
        "Course not found or you do not have permission",
      );
    }

    const bulkOps = lessonOrders.map(({ lessonId, order }) => ({
      updateOne: {
        filter: { _id: lessonId, course: courseId },
        update: { $set: { order } },
      },
    }));

    await LessonModel.bulkWrite(bulkOps);

    return { message: "Lessons reordered successfully" };
  }

  async PublishLesson(lessonId, instructorId) {
    const lesson = await LessonModel.findOneAndUpdate(
      {
        _id: lessonId,
        instructor: instructorId,
      },
      { isPublished: true },
      { new: true },
    );

    if (!lesson) {
      throw GenericErrors.elementNotFound("Lesson");
    }

    return lesson;
  }

  async UnpublishLesson(lessonId, instructorId) {
    const lesson = await LessonModel.findOneAndUpdate(
      {
        _id: lessonId,
        instructor: instructorId,
      },
      { isPublished: false },
      { new: true },
    );

    if (!lesson) {
      throw GenericErrors.elementNotFound("Lesson");
    }

    return lesson;
  }
}

export const lessonService = new LessonService();

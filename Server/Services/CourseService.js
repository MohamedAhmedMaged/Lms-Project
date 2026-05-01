import { CourseModel } from "../Models/Course.js";
import { EnrollmentModel } from "../Models/Enrollment.js";
import { LessonModel } from "../Models/Lesson.js";
import { UserModel } from "../Models/User.js";
import slugify from "slugify";
import { GenericErrors } from "../Errors/CustomErrors.js";

class CourseService {
  async CreateCourse(courseData, instructorId) {
    const {
      title,
      description,
      thumbnail,
      category,
      price,
      discountPrice,
      level,
      duration,
      tags,
      requirements,
      whatYouWillLearn,
    } = courseData;

    const slug = slugify(title, { lower: true, strict: true });

    let course;
    try {
      course = await CourseModel.create({
        title,
        slug,
        description,
        thumbnail,
        category,
        price,
        discountPrice,
        level,
        duration,
        tags,
        requirements,
        whatYouWillLearn,
        instructors: [instructorId],
      });
    } catch (error) {
      if (error.code === 11000) {
        throw GenericErrors.duplicateData(
          "Course",
          "You already have a course with this title",
        );
      }
      throw error;
    }

    return course;
  }

  async GetAllCourses(params = {}) {
    const { limit, category, ...filter } = params;
    const query = { isPublished: true, ...filter };

    if (category) query.category = category;

    const courses = await CourseModel.find(query)
      .populate("instructors", "firstName lastName avatar")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit ? Number(limit) : 50);

    return courses;
  }

  async GetCourseById(courseId) {
    const course = await CourseModel.findById(courseId)
      .populate("instructors", "firstName lastName avatar bio")
      .populate("category", "name slug");

    if (!course) {
      throw GenericErrors.elementNotFound("Course");
    }

    return course;
  }

  async GetCourseBySlug(slug) {
    const course = await CourseModel.findOne({ slug, isPublished: true })
      .populate("instructors", "firstName lastName avatar bio")
      .populate("category", "name slug");

    if (!course) {
      throw GenericErrors.elementNotFound("Course");
    }

    return course;
  }

  async UpdateCourse(courseId, instructorId, updateData, isAdmin = false) {
    const course = isAdmin
      ? await CourseModel.findById(courseId)
      : await CourseModel.findOne({
          _id: courseId,
          instructors: { $in: [instructorId] },
        });

    if (!course) {
      throw GenericErrors.noPermission(
        "Course not found or you do not have permission to edit it",
      );
    }

    if (updateData.title) {
      updateData.slug = slugify(updateData.title, {
        lower: true,
        strict: true,
      });
    }

    Object.assign(course, updateData);
    await course.save();

    return course;
  }

  async DeleteCourse(courseId, instructorId, isAdmin = false) {
    const course = isAdmin
      ? await CourseModel.findById(courseId)
      : await CourseModel.findOne({
          _id: courseId,
          instructors: { $in: [instructorId] },
        });

    if (!course) {
      throw GenericErrors.noPermission(
        "Course not found or you do not have permission to delete it",
      );
    }

    await course.softDelete();

    return { message: "Course deleted successfully" };
  }

  async PublishCourse(courseId, instructorId, isAdmin = false) {
    const filter = isAdmin
      ? { _id: courseId }
      : { _id: courseId, instructors: { $in: [instructorId] } };

    const course = await CourseModel.findOneAndUpdate(
      filter,
      { isPublished: true },
      { new: true },
    );

    if (!course) {
      throw GenericErrors.elementNotFound("Course");
    }

    return course;
  }

  async UnpublishCourse(courseId, instructorId, isAdmin = false) {
    const filter = isAdmin
      ? { _id: courseId }
      : { _id: courseId, instructors: { $in: [instructorId] } };

    const course = await CourseModel.findOneAndUpdate(
      filter,
      { isPublished: false },
      { new: true },
    );

    if (!course) {
      throw GenericErrors.elementNotFound("Course");
    }

    return course;
  }

  async GetInstructorCourses(instructorId) {
    const courses = await CourseModel.find({
      instructors: { $in: [instructorId] },
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return courses;
  }

  async GetStudentEnrolledCourses(studentId) {
    const enrollments = await EnrollmentModel.find({
      student: studentId,
      status: { $in: ["active", "completed"] },
    })
      .populate({
        path: "course",
        populate: {
          path: "instructors",
          select: "firstName lastName avatar",
        },
      })
      .sort({ enrolledAt: -1 });

    const results = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        if (!course) return enrollment;

        const totalLessons = await LessonModel.countDocuments({
          course: course._id,
          isPublished: true,
        });

        const completedCount = enrollment.completedLessons?.length || 0;
        const progress =
          totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

        const lessons = await LessonModel.find({
          course: course._id,
          isPublished: true,
        }).select("duration");
        const totalMinutes = lessons.reduce(
          (sum, l) => sum + (l.duration || 0),
          0,
        );

        const enrollmentObj = enrollment.toObject();
        enrollmentObj.id = enrollmentObj._id.toString();
        delete enrollmentObj._id;
        enrollmentObj.progress = progress;
        enrollmentObj.totalLessons = totalLessons;
        enrollmentObj.completedLessonsCount = completedCount;
        if (course) {
          const courseObj = course.toObject();
          courseObj.id = courseObj._id.toString();
          delete courseObj._id;
          courseObj.lessonsCount = totalLessons;
          courseObj.totalDuration = totalMinutes;
          enrollmentObj.course = courseObj;
        }
        return enrollmentObj;
      }),
    );

    return results;
  }

  async SearchCourses(searchTerm) {
    const courses = await CourseModel.find({
      isPublished: true,
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { tags: { $in: [new RegExp(searchTerm, "i")] } },
      ],
    })
      .populate("instructors", "firstName lastName avatar")
      .populate("category", "name slug")
      .limit(20);

    return courses;
  }
}

export const courseService = new CourseService();

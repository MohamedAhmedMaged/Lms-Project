import { ReviewModel } from "../Models/Review.js";
import { CourseModel } from "../Models/Course.js";
import { EnrollmentModel } from "../Models/Enrollment.js";
import { GenericErrors, AppError } from "../Errors/CustomErrors.js";
import { mongoose } from "../imports.js";

class ReviewService {
  async CreateReview(reviewData) {
    const { studentId, courseId, rating, content } = reviewData;

    const enrollment = await EnrollmentModel.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      throw GenericErrors.noPermission(
        "You must be enrolled in this course to leave a review",
      );
    }

    let review;
    try {
      review = await ReviewModel.create({
        student: studentId,
        course: courseId,
        rating,
        content,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw GenericErrors.duplicateData(
          "Review",
          "You have already reviewed this course",
        );
      }
      throw error;
    }

    await this.updateCourseRating(courseId);

    return review;
  }

  async GetCourseReviews(courseId) {
    const reviews = await ReviewModel.find({ course: courseId })
      .populate("student", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    return reviews;
  }

  async GetReviewById(reviewId) {
    const review = await ReviewModel.findById(reviewId)
      .populate("student", "firstName lastName avatar")
      .populate("course", "title slug");

    if (!review) {
      throw GenericErrors.elementNotFound("Review");
    }

    return review;
  }

  async UpdateReview(reviewId, studentId, updateData) {
    const review = await ReviewModel.findOne({
      _id: reviewId,
      student: studentId,
    });

    if (!review) {
      throw GenericErrors.noPermission(
        "Review not found or you do not have permission to edit it",
      );
    }
    if (updateData.rating) review.rating = updateData.rating;
    if (updateData.content !== undefined) review.content = updateData.content;

    await review.save();

    await this.updateCourseRating(review.course);

    return review;
  }

  async DeleteReview(reviewId, studentId) {
    const review = await ReviewModel.findOne({
      _id: reviewId,
      student: studentId,
    });

    if (!review) {
      throw GenericErrors.noPermission(
        "Review not found or you do not have permission to delete it",
      );
    }

    const courseId = review.course;

    await review.softDelete();

    await this.updateCourseRating(courseId);

    return { message: "Review deleted successfully" };
  }

  async updateCourseRating(courseId) {
    const result = await ReviewModel.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

    await CourseModel.findByIdAndUpdate(courseId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  }

  async GetUserReviews(studentId) {
    const reviews = await ReviewModel.find({ student: studentId })
      .populate("course", "title slug thumbnail")
      .sort({ createdAt: -1 });

    return reviews;
  }
}

export const reviewService = new ReviewService();

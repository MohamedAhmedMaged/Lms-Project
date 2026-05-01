import { Schema, model } from "../imports.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    duration: {
      type: Number,
      default: 0,
    },

    lessonsCount: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    requirements: [
      {
        type: String,
      },
    ],

    whatYouWillLearn: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

CourseSchema.index({ title: 1, instructors: 1 }, { unique: true });

CourseSchema.plugin(SoftDeletePlugin);

export const CourseModel = model("Course", CourseSchema);

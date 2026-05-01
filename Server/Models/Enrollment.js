import { Schema, model } from "../imports.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const EnrollmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    completedLessons: [
      {
        lesson: {
          type: Schema.Types.ObjectId,
          ref: "Lesson",
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastAccessedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    certificateIssued: {
      type: Boolean,
      default: false,
    },

    certificateUrl: {
      type: String,
      default: null,
    },
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

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

EnrollmentSchema.plugin(SoftDeletePlugin);

export const EnrollmentModel = model("Enrollment", EnrollmentSchema);

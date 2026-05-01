import { Schema, model } from "../imports.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const LessonSchema = new Schema(
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
      lowercase: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      default: null,
    },

    videoUrl: {
      type: String,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      required: true,
      min: 0,
    },

    isPreview: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "video", "link", "code"],
        },
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

LessonSchema.index({ course: 1, order: 1 });

LessonSchema.plugin(SoftDeletePlugin);

export const LessonModel = model("Lesson", LessonSchema);

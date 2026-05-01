import { Schema, model } from "../imports.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const ReviewSchema = new Schema(
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

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    content: {
      type: String,
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

ReviewSchema.index({ student: 1, course: 1 }, { unique: true });

ReviewSchema.plugin(SoftDeletePlugin);

export const ReviewModel = model("Review", ReviewSchema);

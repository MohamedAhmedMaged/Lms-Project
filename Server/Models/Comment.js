import { Schema, model } from "../imports.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    isInstructorReply: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    editedAt: {
      type: Date,
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

CommentSchema.index({ lesson: 1, createdAt: -1 });

CommentSchema.plugin(SoftDeletePlugin);

export const CommentModel = model("Comment", CommentSchema);

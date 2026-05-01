import { Schema, model } from "../imports.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      maxlength: 500,
      default: null,
    },

    icon: {
      type: String,
      default: null,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    courseCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
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

CategorySchema.plugin(SoftDeletePlugin);

export const CategoryModel = model("Category", CategorySchema);

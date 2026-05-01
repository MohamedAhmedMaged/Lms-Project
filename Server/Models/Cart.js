import { Schema, model } from "../imports.js";

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    couponCode: {
      type: String,
      default: null,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
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

export const CartModel = model("Cart", CartSchema);

import { Schema, model } from "../imports.js";

const PaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
      default: null,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });

export const PaymentModel = model("Payment", PaymentSchema);

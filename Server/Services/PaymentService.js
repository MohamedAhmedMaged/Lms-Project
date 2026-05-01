import Stripe from "stripe";
import { PaymentModel } from "../Models/Payment.js";
import { EnrollmentModel } from "../Models/Enrollment.js";
import { CourseModel } from "../Models/Course.js";
import { CartModel } from "../Models/Cart.js";
import { AppError, GenericErrors } from "../Errors/CustomErrors.js";

let stripe = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

class PaymentService {
  async CreateCheckoutSession(userId, userEmail) {
    const cart = await CartModel.findOne({ user: userId }).populate(
      "items.course",
      "title description price discountPrice",
    );

    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    const validItems = cart.items.filter((item) => item.course);

    if (validItems.length === 0) {
      throw new AppError("All items in your cart are no longer available", 400);
    }

    const lineItems = validItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.course.title,
          description: item.course.description?.substring(0, 255),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const totalAmount = validItems.reduce((sum, item) => sum + item.price, 0);

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      customer_email: userEmail,
      metadata: {
        userId: userId.toString(),
      },
    });

    const payment = await PaymentModel.create({
      user: userId,
      items: validItems.map((item) => ({
        course: item.course._id,
        price: item.price,
      })),
      totalAmount,
      stripeSessionId: session.id,
      status: "pending",
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      paymentId: payment._id,
    };
  }

  async VerifyAndCompletePayment(sessionId) {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new AppError("Payment has not been completed yet", 400);
    }

    let payment = await PaymentModel.findOne({ stripeSessionId: sessionId });

    if (!payment) {
      throw GenericErrors.elementNotFound("Payment");
    }

    if (payment.status === "completed") {
      return { status: "already_completed", payment };
    }

    payment.status = "completed";
    payment.completedAt = new Date();
    payment.stripePaymentIntentId = session.payment_intent;
    await payment.save();

    for (const item of payment.items) {
      try {
        await EnrollmentModel.create({
          student: payment.user,
          course: item.course,
          enrolledAt: new Date(),
          status: "active",
        });
      } catch (err) {
        if (err.code === 11000) {
          await EnrollmentModel.findOneAndUpdate(
            { student: payment.user, course: item.course },
            { status: "active", deletedAt: null, enrolledAt: new Date() },
            { options: { includeDeleted: true } },
          );
        } else {
          throw err;
        }
      }

      await CourseModel.findByIdAndUpdate(item.course, {
        $inc: { totalStudents: 1 },
      });
    }

    await CartModel.findOneAndUpdate(
      { user: payment.user },
      { items: [], totalAmount: 0, couponCode: null, discountAmount: 0 },
    );

    return { status: "completed", payment };
  }

  async GetPaymentHistory(userId) {
    const payments = await PaymentModel.find({ user: userId })
      .populate("items.course", "title slug thumbnail")
      .sort({ createdAt: -1 });

    return payments;
  }

  async GetPaymentById(paymentId, userId) {
    const payment = await PaymentModel.findOne({
      _id: paymentId,
      user: userId,
    }).populate("items.course", "title slug thumbnail");

    if (!payment) {
      throw GenericErrors.elementNotFound("Payment");
    }

    return payment;
  }

  async ProcessRefund(paymentId, userId, reason) {
    const payment = await PaymentModel.findOne({
      _id: paymentId,
      user: userId,
      status: "completed",
    });

    if (!payment) {
      throw GenericErrors.elementNotFound("Completed payment");
    }

    const daysSincePayment = Math.floor(
      (Date.now() - payment.completedAt) / (1000 * 60 * 60 * 24),
    );

    if (daysSincePayment > 30) {
      throw new AppError("Refund period has expired (30 days)", 400);
    }

    const refund = await getStripe().refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: "requested_by_customer",
    });

    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.refundAmount = payment.totalAmount;
    payment.refundReason = reason;
    await payment.save();

    for (const item of payment.items) {
      await EnrollmentModel.findOneAndUpdate(
        { student: userId, course: item.course },
        { status: "dropped" },
      );

      await CourseModel.findByIdAndUpdate(item.course, {
        $inc: { totalStudents: -1 },
      });
    }

    return {
      success: true,
      refundId: refund.id,
      message: "Refund processed successfully",
    };
  }
}

export const paymentService = new PaymentService();

import { CartModel } from "../Models/Cart.js";
import { CourseModel } from "../Models/Course.js";
import { EnrollmentModel } from "../Models/Enrollment.js";
import { GenericErrors } from "../Errors/CustomErrors.js";

class CartService {
  async GetCart(userId) {
    let cart = await CartModel.findOne({ user: userId }).populate(
      "items.course",
      "title slug thumbnail price discountPrice instructors",
    );

    if (!cart) {
      cart = await CartModel.create({
        user: userId,
        items: [],
        totalAmount: 0,
      });
    }

    return cart;
  }

  async AddToCart(userId, courseId) {
    const course = await CourseModel.findOne({
      _id: courseId,
      isPublished: true,
    });

    if (!course) {
      throw GenericErrors.elementNotFound("Course");
    }

    const enrollment = await EnrollmentModel.findOne({
      student: userId,
      course: courseId,
    });

    if (enrollment) {
      throw GenericErrors.invalidInput(
        "You are already enrolled in this course",
        "already_enrolled",
      );
    }

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      cart = new CartModel({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => String(item.course) === String(courseId),
    );

    if (existingItem) {
      throw GenericErrors.duplicateData("Course", "Course already in cart");
    }

    const price = course.discountPrice || course.price;

    cart.items.push({
      course: courseId,
      price: price,
    });

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();

    return await this.GetCart(userId);
  }

  async RemoveFromCart(userId, courseId) {
    const cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      throw GenericErrors.elementNotFound("Cart");
    }

    cart.items = cart.items.filter(
      (item) => String(item.course) !== String(courseId),
    );

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();

    return await this.GetCart(userId);
  }

  async ClearCart(userId) {
    const cart = await CartModel.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0, couponCode: null, discountAmount: 0 },
      { new: true },
    );

    if (!cart) {
      throw GenericErrors.elementNotFound("Cart");
    }

    return cart;
  }

  async ApplyCoupon(userId, couponCode) {
    throw GenericErrors.invalidInput(
      "Coupon functionality not implemented yet",
      "not_implemented",
    );
  }

  async RemoveCoupon(userId) {
    const cart = await CartModel.findOneAndUpdate(
      { user: userId },
      { couponCode: null, discountAmount: 0 },
      { new: true },
    );

    if (!cart) {
      throw GenericErrors.elementNotFound("Cart");
    }

    const courseIds = cart.items.map((item) => item.course);
    const courses = await CourseModel.find({ _id: { $in: courseIds } });

    const coursePriceMap = {};
    courses.forEach((course) => {
      coursePriceMap[course._id] = course.discountPrice || course.price;
    });

    cart.items.forEach((item) => {
      item.price = coursePriceMap[item.course] || item.price;
    });

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();

    return await this.GetCart(userId);
  }

  async ValidateCartForCheckout(userId) {
    const cart = await CartModel.findOne({ user: userId }).populate(
      "items.course",
    );

    if (!cart || cart.items.length === 0) {
      throw GenericErrors.invalidInput("Cart is empty", "cart_empty");
    }

    const errors = [];

    for (const item of cart.items) {
      const course = item.course;

      if (!course || !course.isPublished) {
        errors.push(
          `Course "${course?.title || "Unknown"}" is no longer available`,
        );
        continue;
      }

      const enrollment = await EnrollmentModel.findOne({
        student: userId,
        course: course._id,
      });

      if (enrollment) {
        errors.push(`You are already enrolled in "${course.title}"`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, cart };
  }
}

export const cartService = new CartService();

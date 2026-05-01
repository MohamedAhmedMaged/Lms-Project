import { Router } from "express";
import { cartService } from "../Services/CartService.js";
import { authenticate } from "../Middlewares/Auth.Middleware.js";
import { catchAsync } from "../Utils/catchAsync.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  catchAsync(async (req, res) => {
    const cart = await cartService.GetCart(req.user.id);

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }),
);

router.post(
  "/add/:courseId",
  catchAsync(async (req, res) => {
    const cart = await cartService.AddToCart(req.user.id, req.params.courseId);

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }),
);

router.delete(
  "/remove/:courseId",
  catchAsync(async (req, res) => {
    const cart = await cartService.RemoveFromCart(
      req.user.id,
      req.params.courseId,
    );

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }),
);

router.delete(
  "/clear",
  catchAsync(async (req, res) => {
    const cart = await cartService.ClearCart(req.user.id);

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }),
);

router.post(
  "/coupon",
  catchAsync(async (req, res) => {
    const { code } = req.body;
    const cart = await cartService.ApplyCoupon(req.user.id, code);

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }),
);

router.delete(
  "/coupon",
  catchAsync(async (req, res) => {
    const cart = await cartService.RemoveCoupon(req.user.id);

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }),
);

router.get(
  "/validate",
  catchAsync(async (req, res) => {
    const result = await cartService.ValidateCartForCheckout(req.user.id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  }),
);

export { router as CartRouter };

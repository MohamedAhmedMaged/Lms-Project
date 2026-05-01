import { Router } from "express";
import { paymentController } from "../Controllers/PaymentController.js";
import {
  authenticate,
  optionalAuthenticate,
  authorize,
} from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.post("/verify", optionalAuthenticate, paymentController.VerifyPayment);

router.use(authenticate);

router.post("/checkout", paymentController.CreateCheckout);

router.get("/history", paymentController.GetPaymentHistory);

router.get("/:id", paymentController.GetPaymentById);

router.post(
  "/:id/refund",
  authorize("student"),
  paymentController.ProcessRefund,
);

export { router as PaymentRouter };

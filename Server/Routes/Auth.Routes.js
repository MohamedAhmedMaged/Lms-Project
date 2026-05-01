import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../Controllers/AuthController.js";
import { authenticate } from "../Middlewares/Auth.Middleware.js";
import { validateBody } from "../Middlewares/Validate.Middleware.js";
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
} from "../Validators/Auth.Validator.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: "fail",
    message: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  validateBody(RegisterSchema),
  authController.Register,
);

router.post(
  "/login",
  authLimiter,
  validateBody(LoginSchema),
  authController.Login,
);

router.post("/refresh-token", authController.RefreshToken);

router.get("/me", authenticate, authController.GetMe);
router.post("/logout", authenticate, authController.Logout);
router.patch(
  "/change-password",
  authenticate,
  validateBody(ChangePasswordSchema),
  authController.ChangePassword,
);

export { router as AuthRouter };

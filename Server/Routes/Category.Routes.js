import { Router } from "express";
import { categoryController } from "../Controllers/CategoryController.js";
import { authenticate, authorize } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.get("/", categoryController.GetAllCategories);
router.get("/tree", categoryController.GetCategoryTree);
router.get("/slug/:slug", categoryController.GetCategoryBySlug);

router.post(
  "/",
  authenticate,
  authorize("instructor"),
  categoryController.CreateCategory,
);

export { router as CategoryRouter };

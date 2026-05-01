import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "Config", "config.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import { connectDB } from "./Database/DBConnect.js";
import { AuthRouter } from "./Routes/Auth.Routes.js";
import { CourseRouter } from "./Routes/Course.Routes.js";
import { LessonRouter } from "./Routes/Lesson.Routes.js";
import { ReviewRouter } from "./Routes/Review.Routes.js";
import { PaymentRouter } from "./Routes/Payment.Routes.js";
import { CartRouter } from "./Routes/Cart.Routes.js";
import { CategoryRouter } from "./Routes/Category.Routes.js";
import { errorHandler, notFound } from "./Middlewares/ErrorHandlingMw.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/courses", CourseRouter);
app.use("/api/v1/lessons", LessonRouter);
app.use("/api/v1/reviews", ReviewRouter);
app.use("/api/v1/payments", PaymentRouter);
app.use("/api/v1/cart", CartRouter);
app.use("/api/v1/categories", CategoryRouter);

app.use(notFound);

app.use(errorHandler);

connectDB();

export default app;

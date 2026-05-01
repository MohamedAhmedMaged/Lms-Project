import { AppError } from "../Errors/CustomErrors.js";

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong";
  let errors = err.errors || null;

  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    message = "Validation failed";
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  if (err.name === "CastError") {
    statusCode = 400;
    status = "fail";
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    status = "fail";
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    status = "fail";
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    status = "fail";
    message = "Token expired";
  }

  res.status(statusCode).json({
    status,
    message,
    ...(errors?.length > 0 && { errors }),
  });
};

export const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};

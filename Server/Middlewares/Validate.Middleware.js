import { z } from "zod";
import { GenericErrors } from "../Errors/CustomErrors.js";

export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw GenericErrors.validationFailed(errors, "Validation failed");
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.query);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw GenericErrors.validationFailed(errors, "Validation failed");
      }

      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.params);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw GenericErrors.validationFailed(errors, "Validation failed");
      }

      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

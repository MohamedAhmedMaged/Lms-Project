export const ErrorCategory = {
  Validation: "Validation",
  Authorization: "Authorization",
  NotFound: "NotFound",
  Conflict: "Conflict",
  Database: "Database",
  Network: "Network",
  BusinessLogic: "BusinessLogic",
  Unknown: "Unknown",
};

export class AppError extends Error {
  constructor({
    message,
    statusCode = 500,
    category = ErrorCategory.Unknown,
    code,
    technicalDetails = "",
    errors = [],
  }) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.category = category;
    this.code = code;
    this.technicalDetails = technicalDetails;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      category: this.category,
      code: this.code,
      message: this.message,
      errors: this.errors.length > 0 ? this.errors : undefined,
      ...(this.technicalDetails && { technicalDetails: this.technicalDetails }),
    };
  }
}

export const GenericErrors = {
  emptyField: (field = "Field", technicalDetails = "") =>
    new AppError({
      message: `${field} cannot be empty`,
      statusCode: 400,
      category: ErrorCategory.Validation,
      code: "empty_field",
      technicalDetails,
    }),

  invalidInput: (
    message = "Invalid input",
    code = "invalid_input",
    technicalDetails = "",
  ) =>
    new AppError({
      message,
      statusCode: 400,
      category: ErrorCategory.Validation,
      code,
      technicalDetails,
    }),

  validationFailed: (errors = [], message = "Validation failed") =>
    new AppError({
      message,
      statusCode: 400,
      category: ErrorCategory.Validation,
      code: "validation_failed",
      errors,
    }),

  notLoggedIn: (message = "You must log in to access this resource") =>
    new AppError({
      message,
      statusCode: 401,
      category: ErrorCategory.Authorization,
      code: "not_authenticated",
    }),

  noPermission: (
    message = "You do not have permission to perform this action",
  ) =>
    new AppError({
      message,
      statusCode: 403,
      category: ErrorCategory.Authorization,
      code: "permission_denied",
    }),

  elementNotFound: (element = "Resource", id = "", technicalDetails = "") =>
    new AppError({
      message: id
        ? `${element} with ID ${id} not found`
        : `${element} not found`,
      statusCode: 404,
      category: ErrorCategory.NotFound,
      code: "not_found",
      technicalDetails,
    }),

  duplicateData: (field = "Resource", technicalDetails = "") =>
    new AppError({
      message: technicalDetails || `${field} already exists`,
      statusCode: 409,
      category: ErrorCategory.Conflict,
      code: "duplicate_data",
      technicalDetails,
    }),

  databaseError: (technicalDetails = "Database operation failed") =>
    new AppError({
      message: "A database error occurred",
      statusCode: 500,
      category: ErrorCategory.Database,
      code: "database_error",
      technicalDetails,
    }),

  invalidCredentials: (message = "Invalid email or password") =>
    new AppError({
      message,
      statusCode: 401,
      category: ErrorCategory.Authorization,
      code: "invalid_credentials",
    }),

  // // Business Logic Errors (422)
  // businessLogic: (
  //   message = "Business rule violation",
  //   code = "business_rule_violation",
  //   technicalDetails = "",
  // ) =>
  //   new AppError({
  //     message,
  //     statusCode: 422,
  //     category: ErrorCategory.BusinessLogic,
  //     code,
  //     technicalDetails,
  //   }),
};

import { UserModel } from "../Models/User.js";
import { GenericErrors } from "../Errors/CustomErrors.js";
import { verifyAccessToken } from "../Utils/Jwt.Util.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw GenericErrors.notLoggedIn("Please log in to access this resource");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw GenericErrors.notLoggedIn("Please log in to access this resource");
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw GenericErrors.notLoggedIn("Invalid or expired token");
    }

    const user = await UserModel.findById(decoded.userId).select(
      "email role isBanned isActive",
    );

    if (!user) {
      throw GenericErrors.notLoggedIn("User no longer exists");
    }

    if (user.isBanned) {
      throw GenericErrors.noPermission("Account has been banned");
    }

    if (!user.isActive) {
      throw GenericErrors.noPermission("Account is not active");
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(GenericErrors.notLoggedIn("Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      next(GenericErrors.notLoggedIn("Token expired"));
    } else {
      next(error);
    }
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token, continue as guest
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return next(); // Invalid token, continue as guest
    }

    const user = await UserModel.findById(decoded.userId).select(
      "email role isBanned isActive",
    );

    if (user && !user.isBanned && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch {
    next(); // On any error, continue as guest
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(GenericErrors.notLoggedIn("Please log in first"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        GenericErrors.noPermission(
          "You do not have permission to access this resource",
        ),
      );
    }

    next();
  };
};

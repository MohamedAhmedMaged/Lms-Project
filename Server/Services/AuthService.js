import { UserModel } from "../Models/User.js";
import { RefreshTokenModel } from "../Models/RefreshToken.js";
import {
  comparePassword,
  validatePasswordStrength,
} from "../Utils/Password.Util.js";
import { generateTokens } from "../Utils/Jwt.Util.js";
import { GenericErrors } from "../Errors/CustomErrors.js";

class AuthService {
  async register(userData) {
    const { email, firstName, lastName, password, role } = userData;

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      throw GenericErrors.validationFailed(
        passwordCheck.errors.map((e) => ({ field: "password", message: e })),
        "Password does not meet requirements",
      );
    }

    let user;
    try {
      user = await UserModel.create({
        email,
        firstName,
        lastName,
        password,
        role,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw GenericErrors.duplicateData("Email");
      }
      throw error;
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    const refreshDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES) || 7;
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    await RefreshTokenModel.create({
      user: user._id,
      token: refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      throw GenericErrors.invalidCredentials();
    }

    if (user.isBanned) {
      throw GenericErrors.noPermission("Account has been banned");
    }

    if (!user.isActive) {
      throw GenericErrors.noPermission("Account is not active");
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      throw GenericErrors.invalidCredentials();
    }

    await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    const refreshDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES) || 7;
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    await RefreshTokenModel.create({
      user: user._id,
      token: refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId, refreshToken) {
    await RefreshTokenModel.findOneAndUpdate(
      { user: userId, token: refreshToken },
      { isRevoked: true, revokedAt: new Date() },
    );

    return { message: "Logged out successfully" };
  }

  async refreshToken(refreshToken) {
    const tokenDoc = await RefreshTokenModel.findOne({
      token: refreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw GenericErrors.notLoggedIn("Invalid or expired refresh token");
    }

    const user = await UserModel.findById(tokenDoc.user);
    if (!user || user.isBanned || !user.isActive) {
      throw GenericErrors.notLoggedIn("User not found or inactive");
    }

    const { accessToken } = generateTokens(user._id, user.role);

    return {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId) {
    const user = await UserModel.findById(userId).select(
      "email firstName lastName role avatar bio emailVerified lastLoginAt createdAt",
    );
    if (!user) {
      throw GenericErrors.notLoggedIn("User no longer exists");
    }
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async UpdateProfile(userId, UpdatedData) {
    await UserModel.findByIdAndUpdate(userId, UpdatedData);
  }

  async ChangePassword(userId, currentPassword, newPassword) {
    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      throw GenericErrors.notLoggedIn("User no longer exists");
    }

    const isPasswordCorrect = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw GenericErrors.invalidCredentials("Current password is incorrect");
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      throw GenericErrors.validationFailed(
        passwordCheck.errors.map((e) => ({ field: "newPassword", message: e })),
        "New password does not meet requirements",
      );
    }

    user.password = newPassword;
    await user.save();

    await RefreshTokenModel.updateMany(
      { user: userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );

    return { message: "Password changed successfully" };
  }
}

export const authService = new AuthService();

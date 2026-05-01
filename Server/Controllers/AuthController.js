import { authService } from "../Services/AuthService.js";
import { catchAsync } from "../Utils/catchAsync.js";

class AuthController {
  Register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      status: "success",
      data: result,
    });
  });

  Login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  Logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(req.user.id, refreshToken);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  RefreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  GetMe = catchAsync(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      status: "success",
      data: user,
    });
  });

  ChangePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.ChangePassword(
      req.user.id,
      currentPassword,
      newPassword,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });
}

export const authController = new AuthController();

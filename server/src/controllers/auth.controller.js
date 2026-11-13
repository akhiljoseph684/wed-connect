import * as authService from '../services/auth.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';
import { cookieOptions } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(201).json(
    new ApiResponse(201, { user, accessToken, refreshToken }, 'User account registered successfully')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || '';

  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
    userAgent,
    ipAddress,
  });

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(200, { user, accessToken, refreshToken }, 'Logged in successfully')
  );
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await authService.logout(userId);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(refreshToken);

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', newRefreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(200, { user, accessToken, refreshToken: newRefreshToken }, 'Token refreshed')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return res.status(200).json(new ApiResponse(200, user, 'Current user profile'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  return res.status(200).json(new ApiResponse(200, null, 'If that email exists, a password reset link has been sent.'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPasswordWithToken(token, newPassword);
  return res.status(200).json(new ApiResponse(200, null, 'Password reset successful. Please sign in with your new password.'));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, 'Email address verified successfully'));
});

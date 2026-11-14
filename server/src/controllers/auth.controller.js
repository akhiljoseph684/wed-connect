import * as authService from '../services/auth.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';
import { accessTokenCookieOptions, refreshTokenCookieOptions, clearCookieOptions } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  return res.status(201).json(
    new ApiResponse(201, { user }, 'User account registered successfully')
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

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, { user }, 'Logged in successfully')
  );
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (userId) {
    try {
      await authService.logout(userId);
    } catch (e) {
      // Continue even if session logout throws
    }
  }

  res.clearCookie('accessToken', clearCookieOptions);
  res.clearCookie('refreshToken', clearCookieOptions);

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(refreshToken);

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, { user }, 'Token refreshed')
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
  const token = req.params.token || req.body.token || req.query.token;
  const user = await authService.verifyEmailToken(token);
  return res.status(200).json(new ApiResponse(200, { user }, 'Email address verified successfully. Welcome to WedConnect!'));
});

export const resendVerification = asyncHandler(async (req, res) => {
  const email = req.body.email || req.user?.email;
  await authService.resendVerificationEmail(email);
  return res.status(200).json(new ApiResponse(200, null, 'If this account is unverified, a new verification link has been sent.'));
});

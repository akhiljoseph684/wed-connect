import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Session, PlatformSettings } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from '../utils/email.js';

export const register = async ({ firstName, lastName, email, password, isCouple, role }) => {
  const platformSettings = await PlatformSettings.findOne();
  if (platformSettings && platformSettings.allowNewUserRegistrations === false) {
    throw new ApiError(403, 'New registrations are currently disabled by the platform administrator.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email address already exists.');
  }

  const capabilities = {
    isCreator: false,
    isVendor: false,
    isPlanner:  false,
  };

  if(role === "creator"){
    capabilities.isCreator = true;
  }

  if(role === "vendor"){
    capabilities.isVendor = true;
  }

  if(isCouple){
    capabilities.isPlanner = true;
  }

  const rawVerificationToken = crypto.randomBytes(32).toString('hex');
  const hashedVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');

  const user = await User.create({
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim(),
    email: email.toLowerCase(),
    passwordHash: password,
    capabilities: {
      isCreator: Boolean(capabilities.isCreator),
      isVendor: Boolean(capabilities.isVendor),
      isPlanner: Boolean(capabilities.isPlanner || true), // defaults to planner enabled for couples
    },
    isEmailVerified: false,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Asynchronously send email verification without blocking registration
  sendEmailVerificationEmail(user.email, rawVerificationToken, user.firstName).catch((err) => {
    console.error(`[Email Verification Warning] Failed to send verification to ${user.email}:`, err.message);
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store session
  const salt = await bcrypt.genSalt(10);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  await Session.create({
    userId: user._id,
    refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const userObject = user.toObject();
  delete userObject.passwordHash;

  return { user: userObject, accessToken, refreshToken };
};

export const login = async ({ email, password, userAgent = '', ipAddress = '' }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.isSuspended) {
    throw new ApiError(403, `Account suspended: ${user.suspensionReason || 'Please contact support.'}`);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const salt = await bcrypt.genSalt(10);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  await Session.create({
    userId: user._id,
    refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const userObject = user.toObject();
  delete userObject.passwordHash;

  return { user: userObject, accessToken, refreshToken };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || user.isSuspended) {
    throw new ApiError(401, 'User no longer authorized');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId) => {
  if (userId) {
    await Session.deleteMany({ userId });
  }
  return true;
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return true silently for security
    return true;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  await sendPasswordResetEmail(user.email, resetToken, user.firstName);
  return true;
};

export const resetPasswordWithToken = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  user.passwordHash = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return true;
};

export const verifyEmailToken = async (token) => {
  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired email verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

export const resendVerificationEmail = async (email) => {
  if (!email) {
    throw new ApiError(400, 'Email address is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return true silently so user enumeration is mitigated
    return true;
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Your email is already verified. You may sign in directly.');
  }

  const rawVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendEmailVerificationEmail(user.email, rawVerificationToken, user.firstName);
  return true;
};


import { ApiError } from '../utils/apiResponse.js';
import { verifyAccessToken } from '../utils/token.js';
import { User, Business, WeddingPlan, WeddingPlanMember, PlatformSettings } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required. Please sign in.'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(new ApiError(401, 'Session expired or token invalid. Please sign in again.'));
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new ApiError(401, 'User account no longer exists.'));
    }

    if (user.isSuspended) {
      return next(new ApiError(403, `Account suspended: ${user.suspensionReason || 'Contact support'}`));
    }

    // Check platform settings (maintenance mode and email verification)
    const platformSettings = await PlatformSettings.findOne();
    if (platformSettings) {
      if (platformSettings.maintenanceMode && user.role !== 'admin') {
        return next(
          new ApiError(503, 'WedConnect is currently undergoing planned maintenance. Please check back shortly.')
        );
      }
      if (platformSettings.enforceEmailVerification && !user.isEmailVerified && user.role !== 'admin') {
        return next(
          new ApiError(403, 'Email verification is required by platform policy. Please verify your email to proceed.')
        );
      }
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user && !user.isSuspended) {
          req.user = user;
        }
      } catch (e) {
        // Ignore invalid token in optionalAuth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied: insufficient permissions.'));
    }
    next();
  };
};

export const requireCapability = (capability) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (req.user.role === 'admin') {
      return next(); // Admins have full access
    }
    if (!req.user.capabilities || !req.user.capabilities[capability]) {
      return next(new ApiError(403, `You need to activate ${capability} capability to perform this action.`));
    }
    next();
  };
};

export const requireBusinessOwner = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.businessId;
    if (!businessId) {
      return next(new ApiError(400, 'Business ID is required'));
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return next(new ApiError(404, 'Business not found'));
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'You are not authorized to manage this business profile.'));
    }

    req.business = business;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireWeddingPlanAccess = async (req, res, next) => {
  try {
    const planId = req.params.planId || req.body.planId;
    if (!planId) {
      return next(new ApiError(400, 'Wedding plan ID is required'));
    }

    const plan = await WeddingPlan.findById(planId);
    if (!plan) {
      return next(new ApiError(404, 'Wedding plan not found'));
    }

    if (req.user.role === 'admin' || plan.ownerId.toString() === req.user._id.toString()) {
      req.weddingPlan = plan;
      req.planRole = 'owner';
      return next();
    }

    // Check membership
    const member = await WeddingPlanMember.findOne({ planId, userId: req.user._id, status: 'accepted' });
    if (!member) {
      return next(new ApiError(403, 'You do not have permission to view or manage this wedding plan.'));
    }

    // Enforce viewer restrictions (block write operations for role === 'viewer')
    if (member.role === 'viewer' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next(new ApiError(403, 'Collaborators with viewer permissions have read-only access.'));
    }

    req.weddingPlan = plan;
    req.planRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};

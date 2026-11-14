import mongoose from "mongoose";
import { WeddingPlanMember } from "../models/index.js";
import { ApiError } from "../utils/apiResponse.js";

const rolePermissions = {
  read: ["owner", "collaborator", "viewer"],
  edit: ["owner", "collaborator"],
  manageMembers: ["owner"],
  delete: ["owner"],
};

export const requirePlanPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { planId } = req.params;
      const userId = req.user?._id;

      if (!mongoose.Types.ObjectId.isValid(planId)) {
        throw new ApiError(400, "Invalid wedding plan ID");
      }

      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const member = await WeddingPlanMember.findOne({
        planId,
        userId,
        status: "accepted",
      });

      if (!member) {
        throw new ApiError(
          403,
          "You are not an accepted member of this wedding plan",
        );
      }

      const allowedRoles = rolePermissions[permission];

      if (!allowedRoles) {
        throw new ApiError(500, "Invalid permission configuration");
      }

      if (!allowedRoles.includes(member.role)) {
        throw new ApiError(
          403,
          `You do not have permission to ${permission} this wedding plan`,
        );
      }

      req.planMember = member;
      req.planRole = member.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

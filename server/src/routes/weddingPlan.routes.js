import { Router } from "express";
import { body } from "express-validator";
import * as weddingPlanController from "../controllers/weddingPlan.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requirePlanPermission } from "../middlewares/weddingPlan.middleware.js";

const router = Router();

router.get("/", authenticate, weddingPlanController.getWeddingPlans);

router.post(
  "/",
  authenticate,
  [
    body().custom((value) => {
      const p1 =
        value.partner1Name ||
        value.coupleNames?.partner1Name ||
        value.coupleNames?.partner1;

      const p2 =
        value.partner2Name ||
        value.coupleNames?.partner2Name ||
        value.coupleNames?.partner2;

      if (!p1 || !p1.toString().trim()) {
        throw new Error("Partner 1 name is required");
      }

      if (!p2 || !p2.toString().trim()) {
        throw new Error("Partner 2 name is required");
      }

      return true;
    }),
    body("weddingDate").notEmpty().withMessage("Wedding date is required"),
    validate,
  ],
  weddingPlanController.createWeddingPlan,
);

router.get(
  "/:planId",
  authenticate,
  requirePlanPermission("read"),
  weddingPlanController.getWeddingPlanDetails,
);

// Edit Wedding Plan
router.patch(
  "/:planId",
  authenticate,
  requirePlanPermission("edit"),
  weddingPlanController.updateWeddingPlan,
);

router.delete(
  "/:planId",
  authenticate,
  requirePlanPermission("delete"),
  weddingPlanController.deleteWeddingPlan,
);

router.put(
  "/:planId/vendors",
  authenticate,
  requirePlanPermission("edit"),
  weddingPlanController.toggleSaveVendor,
);

router.post(
  "/:planId/timeline",
  authenticate,
  requirePlanPermission("edit"),
  weddingPlanController.addTimelineEvent,
);

router.delete(
  "/:planId/timeline/:eventIndex",
  authenticate,
  requirePlanPermission("edit"),
  weddingPlanController.deleteTimelineEvent,
);

router.post(
  "/:planId/members",
  authenticate,
  requirePlanPermission("manageMembers"),
  weddingPlanController.addMember,
);

router.patch(
  "/:planId/members/:memberId",
  authenticate,
  requirePlanPermission("manageMembers"),
  weddingPlanController.updateMemberRole,
);

router.delete(
  "/:planId/members/:memberId",
  authenticate,
  requirePlanPermission("manageMembers"),
  weddingPlanController.removeMember,
);

export default router;

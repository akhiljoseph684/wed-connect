import { Router } from "express";
import * as creatorController from "../controllers/creator.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", creatorController.getCreators);
router.get("/profile/:username", creatorController.getCreatorByUserId);
router.post("/profile", authenticate, creatorController.upsertProfile);
router.patch("/profile", authenticate, creatorController.upsertProfile);

router.post("/portfolio", authenticate, creatorController.addPortfolio);
router.patch("/portfolio/:id", authenticate, creatorController.updatePortfolio);
router.delete(
  "/portfolio/:id",
  authenticate,
  creatorController.deletePortfolio,
);

router.get("/analytics", authenticate, creatorController.getAnalytics);
router.get(
  "/collaborations",
  authenticate,
  creatorController.getCollaborations,
);
router.post(
  "/collaborations",
  authenticate,
  creatorController.createCollaboration,
);

export default router;

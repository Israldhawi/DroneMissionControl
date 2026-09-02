import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMissionStats } from "../services/stats.service";

const router = Router();

router.get("/stats", requireAuth, (_req, res) => {
  const stats = getMissionStats();

  res.status(200).json(stats);
});

export default router;
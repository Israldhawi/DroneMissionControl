import { Router } from "express";
import {
  createNewPilot,
  editPilot,
  getPilotById,
  listPilots,
} from "../services/pilot.service";
import { AppError } from "../utils/errors";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

function handleError(
  res: import("express").Response,
  error: unknown,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields
          ? { fields: error.fields }
          : {}),
      },
    });

    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}

router.get(
  "/",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      res.status(200).json({
        data: listPilots(),
      });
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.get(
  "/:id",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      res.status(200).json(getPilotById(String(req.params.id)));
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    try {
      const body = req.body as {
        name?: unknown;
        email?: unknown;
        licenseNumber?: unknown;
        role?: unknown;
        isActive?: unknown;
        password?: unknown;
      };

      const result = createNewPilot({
        name: body.name as string,
        email: body.email as string,
        licenseNumber: body.licenseNumber as string,
        role: body.role as "admin" | "pilot",
        isActive: body.isActive as boolean,
        password: body.password as string,
      });

      res.status(201).json(result);
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    try {
      const body = req.body as {
        name?: string;
        email?: string;
        licenseNumber?: string;
        role?: "admin" | "pilot";
        isActive?: boolean;
        password?: string;
      };

      const result = editPilot(String(req.params.id), body);

      res.status(200).json(result);
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

export default router;
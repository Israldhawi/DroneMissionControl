import { Router } from "express";
import {
  createNewMission,
  getMission,
  listMissions,
  updateMissionDetails,
  removeMission,
} from "../services/mission.service";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import type {
  MissionStatus,
  Weather,
} from "../types/mission";
import type { MissionFilters } from "../repositories/mission.repository";
import { AppError } from "../utils/errors";

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

function getAuthContext(
  req: AuthenticatedRequest,
) {
  if (!req.user) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Authentication required",
    );
  }

  return {
    userId: req.user.id,
    role: req.user.role,
  };
}

router.get(
  "/",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      const auth = getAuthContext(req);

      const status =
        typeof req.query.status === "string"
          ? req.query.status
          : undefined;

      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : undefined;

      const pilotId =
        typeof req.query.pilotId === "string"
          ? req.query.pilotId
          : undefined;

      const dateFrom =
        typeof req.query.dateFrom === "string"
          ? req.query.dateFrom
          : undefined;

      const dateTo =
        typeof req.query.dateTo === "string"
          ? req.query.dateTo
          : undefined;

      const sortBy =
        req.query.sortBy === "durationMinutes"
          ? "durationMinutes"
          : "scheduledAt";

      const sortOrder =
        req.query.sortOrder === "asc"
          ? "asc"
          : "desc";

      const page = Math.max(
        1,
        Number(req.query.page) || 1,
      );

      const pageSize = Math.min(
        100,
        Math.max(
          1,
          Number(req.query.pageSize) || 10,
        ),
      );

      const filters: MissionFilters = {
        search,
        status: status as MissionStatus | undefined,
        pilotId,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
        page,
        pageSize,
      };

      res.status(200).json(
        listMissions(filters, auth),
      );
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
      const auth = getAuthContext(req);

      const mission = getMission(
        String(req.params.id),
        auth,
      );

      res.status(200).json(mission);
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.post(
  "/",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      const auth = getAuthContext(req);

      const body = req.body as {
        title?: unknown;
        pilotId?: unknown;
        location?: unknown;
        scheduledAt?: unknown;
        durationMinutes?: unknown;
        batteryStart?: unknown;
        batteryEnd?: unknown;
        weather?: unknown;
        status?: unknown;
        notes?: unknown;
      };

      const mission = createNewMission(
        {
          title: body.title as string,
          pilotId: body.pilotId as string,
          location: body.location as string,
          scheduledAt: body.scheduledAt as string,
          durationMinutes:
            body.durationMinutes as number,
          batteryStart:
            body.batteryStart as number,
          batteryEnd:
            body.batteryEnd as number | null | undefined,
          weather: body.weather as Weather,
          status:
            body.status as MissionStatus | undefined,
          notes:
            body.notes as string | null | undefined,
        },
        auth,
      );

      res.status(201).json(mission);
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.put(
  "/:id",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      const auth = getAuthContext(req);

      const body = req.body as {
        title?: string;
        pilotId?: string;
        location?: string;
        scheduledAt?: string;
        durationMinutes?: number;
        batteryStart?: number;
        batteryEnd?: number | null;
        weather?: Weather;
        status?: MissionStatus;
        notes?: string | null;
      };

      const mission = updateMissionDetails(
        String(req.params.id),
        body,
        auth,
      );

      res.status(200).json(mission);
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.patch(
  "/:id/status",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      const auth = getAuthContext(req);

      const body = req.body as {
        status?: unknown;
        notes?: unknown;
        batteryEnd?: unknown;
      };

      const mission = updateMissionDetails(
        String(req.params.id),
        {
          status: body.status as MissionStatus,
          notes: body.notes as string | null | undefined,
          batteryEnd:
            body.batteryEnd as number | null | undefined,
        },
        auth,
      );

      res.status(200).json(mission);
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    try {
      const auth = getAuthContext(req);

      removeMission(
        String(req.params.id),
        auth,
      );

      res.status(204).send();
    } catch (error: unknown) {
      handleError(res, error);
    }
  },
);

export default router;
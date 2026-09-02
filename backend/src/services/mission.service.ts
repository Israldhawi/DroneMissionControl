import {
  createMission,
  findMissionById,
  findMissions,
  updateMission,
  deleteMission,
} from "../repositories/mission.repository";

import {
  findPilotById,
} from "../repositories/pilot.repository";

import type {
  Mission,
  MissionStatus,
  Weather,
} from "../types/mission";

import type {
  MissionFilters,
  MissionListResult,
} from "../repositories/mission.repository";

import {
  validateMissionRules,
  validateFutureCompletion,
  validatePilotAssignment,
  hasMissionOverlap,
  type ValidationErrors,
} from "./missionRules";

import { AppError } from "../utils/errors";

import {
  isNonEmptyString,
  isValidIsoDate,
  isValidWeather,
  isValidMissionStatus,
} from "../utils/validation";

export interface AuthContext {
  userId: string;
  role: "admin" | "pilot";
}

export interface CreateMissionInput {
  title: string;
  pilotId: string;
  location: string;
  scheduledAt: string;
  durationMinutes: number;
  batteryStart: number;
  batteryEnd?: number | null;
  weather: Weather;
  status?: MissionStatus;
  notes?: string | null;
}

export interface UpdateMissionInput {
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
}

function validationError(
  fields: Record<string, string>,
): never {
  throw new AppError(
    400,
    "VALIDATION_ERROR",
    "Invalid mission data",
    fields,
  );
}

function validateBasicMissionInput(
  input: CreateMissionInput | UpdateMissionInput,
): void {
  const fields: Record<string, string> = {};

  if (
    input.title !== undefined &&
    (!isNonEmptyString(input.title) ||
      input.title.trim().length < 3 ||
      input.title.trim().length > 80)
  ) {
    fields.title =
      "Title must be between 3 and 80 characters";
  }

  if (
    input.pilotId !== undefined &&
    !isNonEmptyString(input.pilotId)
  ) {
    fields.pilotId = "Pilot is required";
  }

  if (
    input.location !== undefined &&
    !isNonEmptyString(input.location)
  ) {
    fields.location = "Location is required";
  }

  if (
    input.scheduledAt !== undefined &&
    !isValidIsoDate(input.scheduledAt)
  ) {
    fields.scheduledAt = "A valid ISO date is required";
  }

  if (
    input.weather !== undefined &&
    !isValidWeather(input.weather)
  ) {
    fields.weather = "Invalid weather value";
  }

  if (
    input.status !== undefined &&
    !isValidMissionStatus(input.status)
  ) {
    fields.status = "Invalid mission status";
  }

  if (
    input.notes !== undefined &&
    input.notes !== null &&
    (typeof input.notes !== "string" ||
      input.notes.length > 500)
  ) {
    fields.notes =
      "Notes must be null or at most 500 characters";
  }

  if (Object.keys(fields).length > 0) {
    validationError(fields);
  }
}

function validateRuleErrors(
  fields: ValidationErrors,
): void {
  if (Object.keys(fields).length > 0) {
    validationError(
      Object.fromEntries(
        Object.entries(fields).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    );
  }
}

function ensurePilotCanBeAssigned(
  pilotId: string,
): void {
  const pilot = findPilotById(pilotId);

  if (!pilot) {
    throw new AppError(
      404,
      "PILOT_NOT_FOUND",
      "Pilot not found",
    );
  }

  validateRuleErrors(
    validatePilotAssignment(pilot),
  );
}

function ensureMissionOwnership(
  mission: Mission,
  auth: AuthContext,
): void {
  if (
    auth.role === "pilot" &&
    mission.pilotId !== auth.userId
  ) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You do not have permission to access this mission",
    );
  }
}

export function getMission(
  id: string,
  auth: AuthContext,
): Mission {
  const mission = findMissionById(id);

  if (!mission) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Mission not found",
    );
  }

  ensureMissionOwnership(mission, auth);

  return mission;
}

export function listMissions(
  filters: MissionFilters,
  auth: AuthContext,
): MissionListResult {
  if (auth.role === "pilot") {
    filters = {
      ...filters,
      pilotId: auth.userId,
    };
  }

  return findMissions(filters);
}

function validateAbortReason(
  status: MissionStatus,
  notes: string | null,
): void {
  if (
    status === "aborted" &&
    (!notes || notes.trim().length < 10)
  ) {
    validationError({
      notes:
        "An abort reason must be at least 10 characters",
    });
  }
}

export function createNewMission(
  input: CreateMissionInput,
  auth: AuthContext,
): Mission {
  validateBasicMissionInput(input);

  if (auth.role === "pilot") {
    input = {
      ...input,
      pilotId: auth.userId,
    };
  }

  const status = input.status ?? "planned";
  const batteryEnd = input.batteryEnd ?? null;

  validateAbortReason(
  status,
  input.notes ?? null,
);

  const ruleErrors = validateMissionRules({
    batteryStart: input.batteryStart,
    batteryEnd,
    durationMinutes: input.durationMinutes,
  });

  validateRuleErrors(ruleErrors);

  validateRuleErrors(
    validateFutureCompletion(
      input.scheduledAt,
      status,
    ),
  );

  ensurePilotCanBeAssigned(input.pilotId);

  const existingMissions = findMissions({
    pilotId: input.pilotId,
    page: 1,
    pageSize: 1000,
  }).data;

  if (
    hasMissionOverlap(
      {
        id: "",
        pilotId: input.pilotId,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
      },
      existingMissions,
    )
  ) {
    validationError({
      pilotId:
        "The pilot already has an overlapping mission",
    });
  }

  const mission: Mission = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    pilotId: input.pilotId,
    location: input.location.trim(),
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    batteryStart: input.batteryStart,
    batteryEnd,
    weather: input.weather,
    status,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return createMission(mission);
}

export function updateMissionDetails(
  id: string,
  input: UpdateMissionInput,
  auth: AuthContext,
): Mission {
  const existing = findMissionById(id);

  if (!existing) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Mission not found",
    );
  }

  ensureMissionOwnership(existing, auth);

  // Completed and aborted missions are final and read-only.
  if (
    existing.status === "completed" ||
    existing.status === "aborted"
  ) {
    throw new AppError(
      400,
      "MISSION_READ_ONLY",
      "Completed and aborted missions are read-only",
    );
  }

  // Pilots may only edit their own planned/in-progress missions.
  // Ownership was already checked above.
  if (
    auth.role === "pilot" &&
    existing.status !== "planned" &&
    existing.status !== "in_progress"
  ) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You do not have permission to edit this mission",
    );
  }

  validateBasicMissionInput(input);

  const updatedPilotId =
    input.pilotId ?? existing.pilotId;

  const updatedScheduledAt =
    input.scheduledAt ?? existing.scheduledAt;

  const updatedDuration =
    input.durationMinutes ?? existing.durationMinutes;

  const updatedBatteryStart =
    input.batteryStart ?? existing.batteryStart;

  const updatedBatteryEnd =
    input.batteryEnd !== undefined
      ? input.batteryEnd
      : existing.batteryEnd;

  const updatedStatus =
    input.status ?? existing.status;

  const updatedWeather =
    input.weather ?? existing.weather;

  const updatedTitle =
    input.title !== undefined
      ? input.title.trim()
      : existing.title;

  const updatedLocation =
    input.location !== undefined
      ? input.location.trim()
      : existing.location;

  const updatedNotes =
    input.notes !== undefined
      ? input.notes
      : existing.notes;

      validateAbortReason(
        updatedStatus,
        updatedNotes,
);

  // Pilots cannot change the mission to another pilot.
  if (
    auth.role === "pilot" &&
    updatedPilotId !== auth.userId
  ) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Pilots can only edit their own missions",
    );
  }

  // R-06: validate lifecycle transition.
  validateRuleErrors(
    validateStatusTransitionForUpdate(
      existing.status,
      updatedStatus,
    ),
  );

  // R-01 and R-02.
  validateRuleErrors(
    validateMissionRules({
      batteryStart: updatedBatteryStart,
      batteryEnd: updatedBatteryEnd,
      durationMinutes: updatedDuration,
    }),
  );

  // R-03.
  validateRuleErrors(
    validateFutureCompletion(
      updatedScheduledAt,
      updatedStatus,
    ),
  );

  // R-05: only check inactive-pilot rule when assigning
  // a different pilot.
  if (updatedPilotId !== existing.pilotId) {
    ensurePilotCanBeAssigned(updatedPilotId);
  }

  // R-04: no overlapping missions for the same pilot.
  const existingMissions = findMissions({
    pilotId: updatedPilotId,
    page: 1,
    pageSize: 1000,
  }).data;

  if (
    hasMissionOverlap(
      {
        id: existing.id,
        pilotId: updatedPilotId,
        scheduledAt: updatedScheduledAt,
        durationMinutes: updatedDuration,
      },
      existingMissions,
      existing.id,
    )
  ) {
    validationError({
      pilotId:
        "The pilot already has an overlapping mission",
    });
  }

  // R-06: completing requires batteryEnd.
  if (
    updatedStatus === "completed" &&
    updatedBatteryEnd === null
  ) {
    validationError({
      batteryEnd:
        "Battery end is required when completing a mission",
    });
  }

  const mission: Mission = {
    id: existing.id,
    title: updatedTitle,
    pilotId: updatedPilotId,
    location: updatedLocation,
    scheduledAt: updatedScheduledAt,
    durationMinutes: updatedDuration,
    batteryStart: updatedBatteryStart,
    batteryEnd: updatedBatteryEnd,
    weather: updatedWeather,
    status: updatedStatus,
    notes: updatedNotes,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  return updateMission(mission);
}

function validateStatusTransitionForUpdate(
  currentStatus: MissionStatus,
  newStatus: MissionStatus,
): ValidationErrors {
  if (currentStatus === newStatus) {
    return {};
  }

  const allowedTransitions: Record<
    MissionStatus,
    MissionStatus[]
  > = {
    planned: ["in_progress", "aborted"],
    in_progress: ["completed", "aborted"],
    completed: [],
    aborted: [],
  };

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    return {
      status:
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return {};
}

export function removeMission(
  id: string,
  auth: AuthContext,
): void {
  const mission = findMissionById(id);

  if (!mission) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Mission not found",
    );
  }

  ensureMissionOwnership(mission, auth);

  if (auth.role !== "admin") {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Only admins can delete missions",
    );
  }

  if (
    mission.status === "completed" ||
    mission.status === "aborted"
  ) {
    throw new AppError(
      400,
      "MISSION_READ_ONLY",
      "Completed and aborted missions cannot be deleted",
    );
  }

  const deleted = deleteMission(id);

  if (!deleted) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Mission not found",
    );
  }
}

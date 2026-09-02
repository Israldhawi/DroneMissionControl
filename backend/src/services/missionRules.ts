import type { MissionStatus } from "../types/mission";

export interface MissionRuleInput {
  batteryStart: number;
  batteryEnd: number | null;
  durationMinutes: number;
}

export interface ValidationErrors {
  batteryStart?: string;
  batteryEnd?: string;
  durationMinutes?: string;
  status?: string;
  pilotId?: string;
}

export interface MissionOverlapInput {
  id: string;
  pilotId: string;
  scheduledAt: string;
  durationMinutes: number;
}

/**
 * R-01:
 * batteryStart and batteryEnd must be between 0 and 100.
 * When batteryEnd is provided, it must be lower than batteryStart.
 */
export function validateBattery(
  batteryStart: number,
  batteryEnd: number | null,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (
    !Number.isFinite(batteryStart) ||
    batteryStart < 0 ||
    batteryStart > 100
  ) {
    errors.batteryStart =
      "Battery start must be between 0 and 100";
  }

  if (batteryEnd !== null) {
    if (
      !Number.isFinite(batteryEnd) ||
      batteryEnd < 0 ||
      batteryEnd > 100
    ) {
      errors.batteryEnd =
        "Battery end must be between 0 and 100";
    } else if (batteryEnd >= batteryStart) {
      errors.batteryEnd =
        "Battery end must be lower than battery start";
    }
  }

  return errors;
}

/**
 * R-02:
 * durationMinutes must be a whole number from 1 to 120.
 */
export function validateDuration(
  durationMinutes: number,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 120
  ) {
    errors.durationMinutes =
      "Duration must be a whole number from 1 to 120";
  }

  return errors;
}

/**
 * R-03:
 * A mission scheduled in the future cannot be marked as completed.
 */
export function validateFutureCompletion(
  scheduledAt: string,
  status: string,
  now: Date = new Date(),
): ValidationErrors {
  const errors: ValidationErrors = {};

  const scheduledDate = new Date(scheduledAt);

  if (
    status === "completed" &&
    Number.isNaN(scheduledDate.getTime()) === false &&
    scheduledDate > now
  ) {
    errors.status =
      "A future mission cannot be marked as completed";
  }

  return errors;
}

/**
 * R-04:
 * The same pilot cannot have two missions overlapping in time.
 *
 * Two missions do NOT overlap when:
 * - the first mission ends at or before the second starts, OR
 * - the second mission ends at or before the first starts.
 *
 * The mission being edited is excluded using excludeMissionId.
 */
export function hasMissionOverlap(
  mission: MissionOverlapInput,
  existingMissions: MissionOverlapInput[],
  excludeMissionId?: string,
): boolean {
  const missionStart = new Date(mission.scheduledAt).getTime();
  const missionEnd =
    missionStart + mission.durationMinutes * 60 * 1000;

  return existingMissions.some((existing) => {
    if (existing.id === excludeMissionId) {
      return false;
    }

    if (existing.pilotId !== mission.pilotId) {
      return false;
    }

    const existingStart = new Date(existing.scheduledAt).getTime();
    const existingEnd =
      existingStart + existing.durationMinutes * 60 * 1000;

    const doNotOverlap =
      missionEnd <= existingStart ||
      existingEnd <= missionStart;

    return !doNotOverlap;
  });
}

/**
 * R-05:
 * An inactive pilot cannot be assigned a new mission.
 */
export function validatePilotAssignment(
  pilot: { id: string; isActive: boolean },
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!pilot.isActive) {
    errors.pilotId = "Inactive pilots cannot be assigned new missions";
  }

  return errors;
}

/**
 * Validate the rules that apply to mission input.
 */

/**
 * R-07:
 * An abort reason must contain at least 10 characters.
 */
export function validateAbortReason(
  reason: string | null,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (
    reason === null ||
    reason.trim().length < 10
  ) {
    errors.status =
      "Abort reason must be at least 10 characters";
  }

  return errors;
}

export function validateMissionRules(
  input: MissionRuleInput,
): ValidationErrors {
  return {
    ...validateBattery(input.batteryStart, input.batteryEnd),
    ...validateDuration(input.durationMinutes),
  };
}

/**
 * R-06:
 * Mission status changes must follow the defined lifecycle.
 */
export function validateStatusTransition(
  currentStatus: MissionStatus,
  newStatus: MissionStatus,
): ValidationErrors {
  const errors: ValidationErrors = {};

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
    errors.status =
      `Invalid status transition from ${currentStatus} to ${newStatus}`;
  }

  return errors;
}
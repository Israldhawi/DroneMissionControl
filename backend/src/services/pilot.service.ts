import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import {
  createPilot,
  findPilotByEmail,
  findPilotById,
  findAllPilots,
  findPilotPasswordHash,
  updatePilot,
} from "../repositories/pilot.repository";

import type {
  Pilot,
  PilotWithPassword,
  UserRole,
} from "../types/pilot";

import { AppError } from "../utils/errors";

import {
  isValidEmail,
  isValidLicenseNumber,
  isNonEmptyString,
} from "../utils/validation";

export interface CreatePilotInput {
  name: string;
  email: string;
  licenseNumber: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}

export interface UpdatePilotInput {
  name?: string;
  email?: string;
  licenseNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

function validatePilotInput(
  input: CreatePilotInput | UpdatePilotInput,
): Record<string, string> {
  const fields: Record<string, string> = {};

  if (
    input.name !== undefined &&
    (!isNonEmptyString(input.name) ||
      input.name.trim().length > 80)
  ) {
    fields.name =
      "Name is required and must not exceed 80 characters";
  }

  if (
    input.email !== undefined &&
    !isValidEmail(input.email)
  ) {
    fields.email = "A valid email is required";
  }

  if (
    input.licenseNumber !== undefined &&
    !isValidLicenseNumber(input.licenseNumber)
  ) {
    fields.licenseNumber =
      "License number must contain two letters followed by four digits";
  }

  if (
    input.role !== undefined &&
    input.role !== "admin" &&
    input.role !== "pilot"
  ) {
    fields.role = "Role must be admin or pilot";
  }

  if (
    input.password !== undefined &&
    (typeof input.password !== "string" ||
      input.password.length < 6)
  ) {
    fields.password =
      "Password must be at least 6 characters";
  }

  return fields;
}

function throwValidationError(
  fields: Record<string, string>,
): void {
  if (Object.keys(fields).length > 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Invalid pilot data",
      fields,
    );
  }
}

export function listPilots(): Pilot[] {
  return findAllPilots();
}

export function getPilotById(id: string): Pilot {
  const pilot = findPilotById(id);

  if (!pilot) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Pilot not found",
    );
  }

  return pilot;
}

export function createNewPilot(
  input: CreatePilotInput,
): Pilot {
  const fields = validatePilotInput(input);
  throwValidationError(fields);

  const email = input.email.trim().toLowerCase();

  const licenseNumber = input.licenseNumber
    .trim()
    .toUpperCase();

  if (findPilotByEmail(email)) {
    throw new AppError(
      409,
      "DUPLICATE_EMAIL",
      "A pilot with this email already exists",
      {
        email: "Email is already in use",
      },
    );
  }

  const existingPilots = findAllPilots();

  if (
    existingPilots.some(
      (pilot) =>
        pilot.licenseNumber === licenseNumber,
    )
  ) {
    throw new AppError(
      409,
      "DUPLICATE_LICENSE",
      "A pilot with this license number already exists",
      {
        licenseNumber:
          "License number is already in use",
      },
    );
  }

  const passwordHash = bcrypt.hashSync(
    input.password,
    10,
  );

  const pilot: PilotWithPassword = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    licenseNumber,
    role: input.role,
    isActive: input.isActive,
    missionCount: 0,
    passwordHash,
  };

  return createPilot(pilot);
}

export function editPilot(
  id: string,
  input: UpdatePilotInput,
): Pilot {
  const existing = findPilotById(id);

  if (!existing) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Pilot not found",
    );
  }

  const fields = validatePilotInput(input);
  throwValidationError(fields);

  const email =
    input.email !== undefined
      ? input.email.trim().toLowerCase()
      : existing.email;

  const licenseNumber =
    input.licenseNumber !== undefined
      ? input.licenseNumber.trim().toUpperCase()
      : existing.licenseNumber;

  const pilotWithEmail = findPilotByEmail(email);

  if (
    pilotWithEmail &&
    pilotWithEmail.id !== id
  ) {
    throw new AppError(
      409,
      "DUPLICATE_EMAIL",
      "A pilot with this email already exists",
      {
        email: "Email is already in use",
      },
    );
  }

  const licenseOwner = findAllPilots().find(
    (pilot) =>
      pilot.licenseNumber === licenseNumber &&
      pilot.id !== id,
  );

  if (licenseOwner) {
    throw new AppError(
      409,
      "DUPLICATE_LICENSE",
      "A pilot with this license number already exists",
      {
        licenseNumber:
          "License number is already in use",
      },
    );
  }

  const passwordHash =
    input.password !== undefined
      ? bcrypt.hashSync(input.password, 10)
      : findPilotPasswordHash(id);

  if (!passwordHash) {
    throw new AppError(
      500,
      "PASSWORD_HASH_NOT_FOUND",
      "Pilot password could not be loaded",
    );
  }

  const updatedPilot: PilotWithPassword = {
    id: existing.id,
    name:
      input.name !== undefined
        ? input.name.trim()
        : existing.name,
    email,
    licenseNumber,
    role:
      input.role !== undefined
        ? input.role
        : existing.role,
    isActive:
      input.isActive !== undefined
        ? input.isActive
        : existing.isActive,
    missionCount: existing.missionCount,
    passwordHash,
  };

  return updatePilot(updatedPilot);
}

import db from "../db/database";
import type {
  Pilot,
  PilotWithPassword,
  UserRole,
} from "../types/pilot";

interface PilotRow {
  id: string;
  name: string;
  email: string;
  license_number: string;
  role: UserRole;
  is_active: number;
  mission_count: number;
}

function mapPilot(row: PilotRow): Pilot {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    licenseNumber: row.license_number,
    role: row.role,
    isActive: row.is_active === 1,
    missionCount: row.mission_count,
  };
}
export function findPilotById(id: string): Pilot | null {
  const row = db
    .prepare(
      `
      SELECT
  id,
  name,
  email,
  license_number,
  role,
  is_active,
  (
    SELECT COUNT(*)
    FROM missions
    WHERE missions.pilot_id = pilots.id
  ) AS mission_count
FROM pilots
WHERE id = ?
      `,
    )
    .get(id) as PilotRow | undefined;

  return row ? mapPilot(row) : null;
}

export function findPilotByEmail(email: string): Pilot | null {
  const row = db
    .prepare(
      `
      SELECT
  id,
  name,
  email,
  license_number,
  role,
  is_active,
  (
    SELECT COUNT(*)
    FROM missions
    WHERE missions.pilot_id = pilots.id
  ) AS mission_count
FROM pilots
WHERE email = ?
      `,
    )
    .get(email) as PilotRow | undefined;

  return row ? mapPilot(row) : null;
}

export function findAllPilots(): Pilot[] {
  const rows = db
    .prepare(
      `
      SELECT
  id,
  name,
  email,
  license_number,
  role,
  is_active,
  (
    SELECT COUNT(*)
    FROM missions
    WHERE missions.pilot_id = pilots.id
  ) AS mission_count
FROM pilots
ORDER BY name ASC
      `,
    )
    .all() as PilotRow[];

  return rows.map(mapPilot);
}

export function findPilotForLogin(
  email: string,
): PilotWithPassword | null {
  const row = db
    .prepare(
      `
      SELECT
        id,
        name,
        email,
        license_number,
        role,
        is_active,
        password_hash
      FROM pilots
      WHERE email = ?
      `,
    )
    .get(email) as
    | {
        id: string;
        name: string;
        email: string;
        license_number: string;
        role: UserRole;
        is_active: number;
        password_hash: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    licenseNumber: row.license_number,
    role: row.role,
    isActive: row.is_active === 1,
    missionCount: 0,
    passwordHash: row.password_hash,
  };
}

export function findPilotPasswordHash(
  id: string,
): string | null {
  const row = db
    .prepare(
      `
      SELECT password_hash
      FROM pilots
      WHERE id = ?
      `,
    )
    .get(id) as { password_hash: string } | undefined;

  return row ? row.password_hash : null;
}

export function createPilot(
  pilot: PilotWithPassword,
): Pilot {
  db.prepare(
    `
    INSERT INTO pilots (
      id,
      name,
      email,
      license_number,
      role,
      is_active,
      password_hash
    )
    VALUES (
      @id,
      @name,
      @email,
      @licenseNumber,
      @role,
      @isActive,
      @passwordHash
    )
    `,
  ).run({
    id: pilot.id,
    name: pilot.name,
    email: pilot.email,
    licenseNumber: pilot.licenseNumber,
    role: pilot.role,
    isActive: pilot.isActive ? 1 : 0,
    passwordHash: pilot.passwordHash,
  });

  const createdPilot = findPilotById(pilot.id);

  if (!createdPilot) {
    throw new Error("Failed to create pilot");
  }

  return createdPilot;
}

export function updatePilot(
  pilot: PilotWithPassword,
): Pilot {
  db.prepare(
    `
    UPDATE pilots
    SET
      name = @name,
      email = @email,
      license_number = @licenseNumber,
      role = @role,
      is_active = @isActive,
      password_hash = @passwordHash
    WHERE id = @id
    `,
  ).run({
    id: pilot.id,
    name: pilot.name,
    email: pilot.email,
    licenseNumber: pilot.licenseNumber,
    role: pilot.role,
    isActive: pilot.isActive ? 1 : 0,
    passwordHash: pilot.passwordHash,
  });

  const updatedPilot = findPilotById(pilot.id);

  if (!updatedPilot) {
    throw new Error("Failed to update pilot");
  }

  return updatedPilot;
}


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
}

function mapPilot(row: PilotRow): Pilot {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    licenseNumber: row.license_number,
    role: row.role,
    isActive: row.is_active === 1,
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
        is_active
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
        is_active
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
        is_active
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
    passwordHash: row.password_hash,
  };
}
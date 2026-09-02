import db from "../db/database";
import type {
  Mission,
  MissionStatus,
  Weather,
} from "../types/mission";

interface MissionRow {
  id: string;
  title: string;
  pilot_id: string;
  location: string;
  scheduled_at: string;
  duration_minutes: number;
  battery_start: number;
  battery_end: number | null;
  weather: Weather;
  status: MissionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionFilters {
  search?: string;
  status?: MissionStatus;
  pilotId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "scheduledAt" | "durationMinutes";
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface MissionListResult {
  data: Mission[];
  page: number;
  pageSize: number;
  total: number;
}

function mapMission(row: MissionRow): Mission {
  return {
    id: row.id,
    title: row.title,
    pilotId: row.pilot_id,
    location: row.location,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    batteryStart: row.battery_start,
    batteryEnd: row.battery_end,
    weather: row.weather,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildWhereClause(filters: MissionFilters): {
  where: string;
  parameters: Record<string, string>;
} {
  const conditions: string[] = [];
  const parameters: Record<string, string> = {};

  if (filters.search) {
    conditions.push(
      "(title LIKE @search OR location LIKE @search)",
    );
    parameters.search = `%${filters.search}%`;
  }

  if (filters.status) {
    conditions.push("status = @status");
    parameters.status = filters.status;
  }

  if (filters.pilotId) {
    conditions.push("pilot_id = @pilotId");
    parameters.pilotId = filters.pilotId;
  }

  if (filters.dateFrom) {
    conditions.push("scheduled_at >= @dateFrom");
    parameters.dateFrom = filters.dateFrom;
  }

  if (filters.dateTo) {
    conditions.push("scheduled_at <= @dateTo");
    parameters.dateTo = filters.dateTo;
  }

  return {
    where: conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "",
    parameters,
  };
}

function getSortColumn(
  sortBy: MissionFilters["sortBy"],
): string {
  if (sortBy === "durationMinutes") {
    return "duration_minutes";
  }

  return "scheduled_at";
}

function getSortOrder(
  sortOrder: MissionFilters["sortOrder"],
): string {
  return sortOrder === "asc" ? "ASC" : "DESC";
}

export function findMissionById(id: string): Mission | null {
  const row = db
    .prepare(
      `
      SELECT
        id,
        title,
        pilot_id,
        location,
        scheduled_at,
        duration_minutes,
        battery_start,
        battery_end,
        weather,
        status,
        notes,
        created_at,
        updated_at
      FROM missions
      WHERE id = ?
      `,
    )
    .get(id) as MissionRow | undefined;

  return row ? mapMission(row) : null;
}

export function findMissions(
  filters: MissionFilters,
): MissionListResult {
  const { where, parameters } = buildWhereClause(filters);

  const countRow = db
    .prepare(
      `
      SELECT COUNT(*) AS total
      FROM missions
      ${where}
      `,
    )
    .get(parameters) as { total: number };

  const sortColumn = getSortColumn(filters.sortBy);
  const sortOrder = getSortOrder(filters.sortOrder);
  const offset = (filters.page - 1) * filters.pageSize;

  const rows = db
    .prepare(
      `
      SELECT
        id,
        title,
        pilot_id,
        location,
        scheduled_at,
        duration_minutes,
        battery_start,
        battery_end,
        weather,
        status,
        notes,
        created_at,
        updated_at
      FROM missions
      ${where}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT @limit OFFSET @offset
      `,
    )
    .all({
      ...parameters,
      limit: filters.pageSize,
      offset,
    }) as MissionRow[];

  return {
    data: rows.map(mapMission),
    page: filters.page,
    pageSize: filters.pageSize,
    total: countRow.total,
  };
}

export function createMission(mission: Mission): Mission {
  db.prepare(
    `
    INSERT INTO missions (
      id,
      title,
      pilot_id,
      location,
      scheduled_at,
      duration_minutes,
      battery_start,
      battery_end,
      weather,
      status,
      notes
    )
    VALUES (
      @id,
      @title,
      @pilotId,
      @location,
      @scheduledAt,
      @durationMinutes,
      @batteryStart,
      @batteryEnd,
      @weather,
      @status,
      @notes
    )
    `,
  ).run({
    id: mission.id,
    title: mission.title,
    pilotId: mission.pilotId,
    location: mission.location,
    scheduledAt: mission.scheduledAt,
    durationMinutes: mission.durationMinutes,
    batteryStart: mission.batteryStart,
    batteryEnd: mission.batteryEnd,
    weather: mission.weather,
    status: mission.status,
    notes: mission.notes,
  });

  const createdMission = findMissionById(mission.id);

  if (!createdMission) {
    throw new Error("Failed to create mission");
  }

  return createdMission;
}

export function updateMission(mission: Mission): Mission {
  db.prepare(
    `
    UPDATE missions
    SET
      title = @title,
      pilot_id = @pilotId,
      location = @location,
      scheduled_at = @scheduledAt,
      duration_minutes = @durationMinutes,
      battery_start = @batteryStart,
      battery_end = @batteryEnd,
      weather = @weather,
      status = @status,
      notes = @notes,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
    `,
  ).run({
    id: mission.id,
    title: mission.title,
    pilotId: mission.pilotId,
    location: mission.location,
    scheduledAt: mission.scheduledAt,
    durationMinutes: mission.durationMinutes,
    batteryStart: mission.batteryStart,
    batteryEnd: mission.batteryEnd,
    weather: mission.weather,
    status: mission.status,
    notes: mission.notes,
  });

  const updatedMission = findMissionById(mission.id);

  if (!updatedMission) {
    throw new Error("Failed to update mission");
  }

  return updatedMission;
}

export function deleteMission(id: string): boolean {
  const result = db
    .prepare(
      `
      DELETE FROM missions
      WHERE id = ?
      `,
    )
    .run(id);

  return result.changes > 0;
}
import db from "../db/database";

export interface MissionStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  aborted: number;
  totalFlightTimeMinutes: number;
  averageBatteryUsed: number;
  topPilots: {
    pilotId: string;
    pilotName: string;
    missionCount: number;
  }[];
  statusCounts: {
    status: string;
    count: number;
  }[];
}

export function getMissionStats(): MissionStats {
  const totals = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) AS planned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'aborted' THEN 1 ELSE 0 END) AS aborted,
        COALESCE(SUM(
          CASE
            WHEN status = 'completed'
            THEN duration_minutes
            ELSE 0
          END
        ), 0) AS totalFlightTimeMinutes,
        COALESCE(AVG(
          CASE
            WHEN battery_end IS NOT NULL
            THEN battery_start - battery_end
          END
        ), 0) AS averageBatteryUsed
      FROM missions
    `)
    .get() as {
      total: number;
      planned: number;
      inProgress: number;
      completed: number;
      aborted: number;
      totalFlightTimeMinutes: number;
      averageBatteryUsed: number;
    };

  const topPilots = db
    .prepare(`
      SELECT
        pilots.id AS pilotId,
        pilots.name AS pilotName,
        COUNT(missions.id) AS missionCount
      FROM pilots
      LEFT JOIN missions
        ON missions.pilot_id = pilots.id
      GROUP BY pilots.id, pilots.name
      ORDER BY missionCount DESC, pilots.name ASC
      LIMIT 3
    `)
    .all() as {
      pilotId: string;
      pilotName: string;
      missionCount: number;
    }[];

  const statusCounts = db
    .prepare(`
      SELECT
        status,
        COUNT(*) AS count
      FROM missions
      GROUP BY status
      ORDER BY status ASC
    `)
    .all() as {
      status: string;
      count: number;
    }[];

  return {
    total: totals.total,
    planned: totals.planned,
    inProgress: totals.inProgress,
    completed: totals.completed,
    aborted: totals.aborted,
    totalFlightTimeMinutes: totals.totalFlightTimeMinutes,
    averageBatteryUsed: Number(
      totals.averageBatteryUsed.toFixed(1),
    ),
    topPilots,
    statusCounts,
  };
}

import db from "../db/database";

export interface MissionStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  aborted: number;
}

export function getMissionStats(): MissionStats {
  const row = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) AS planned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'aborted' THEN 1 ELSE 0 END) AS aborted
      FROM missions
    `)
    .get() as {
      total: number;
      planned: number;
      inProgress: number;
      completed: number;
      aborted: number;
    };

  return {
    total: row.total,
    planned: row.planned,
    inProgress: row.inProgress,
    completed: row.completed,
    aborted: row.aborted,
  };
}
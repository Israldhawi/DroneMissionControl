export interface TopPilot {
  pilotId: string;
  pilotName: string;
  missionCount: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface MissionStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  aborted: number;
  totalFlightTimeMinutes: number;
  averageBatteryUsed: number;
  topPilots: TopPilot[];
  statusCounts: StatusCount[];
}

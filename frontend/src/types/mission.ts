export type Weather =
  | "clear"
  | "cloudy"
  | "windy"
  | "rain";

export type MissionStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "aborted";

export interface Mission {
  id: string;
  title: string;
  pilotId: string;
  location: string;
  scheduledAt: string;
  durationMinutes: number;
  batteryStart: number;
  batteryEnd: number | null;
  weather: Weather;
  status: MissionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MissionListResult {
  data: Mission[];
  page: number;
  pageSize: number;
  total: number;
}

export interface MissionFilters {
  search?: string;
  status?: MissionStatus;
  pilotId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "scheduledAt" | "durationMinutes";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CreateMissionRequest {
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

export interface UpdateMissionRequest {
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

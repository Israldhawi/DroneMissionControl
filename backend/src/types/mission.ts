export type Weather = "clear" | "cloudy" | "windy" | "rain";

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
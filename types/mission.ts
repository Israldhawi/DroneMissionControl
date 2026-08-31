export type MissionStatus = 
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Mision {
    id: number;
    name: string;
    description?: string;
    pilotId: number;
    droneId: number;
    startTime: string;
    endTime?: string;
    status: MissionStatus;
    createdAt: string;
    updatedAt: string;
}
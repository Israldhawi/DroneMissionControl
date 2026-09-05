export type PilotRole = "admin" | "pilot";

export interface Pilot {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  role: PilotRole;
  isActive: boolean;
}

export interface PilotListResult {
  data: Pilot[];
}

export type UserRole = "admin" | "pilot";

export interface Pilot {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  role: UserRole;
  isActive: boolean;
  missionCount: number;
}

export interface PilotWithPassword extends Pilot {
  passwordHash: string;
}